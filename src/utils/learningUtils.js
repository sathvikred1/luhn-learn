import { LEARNING_STATUSES, STORAGE_KEYS } from '../config/constants';

export function normalizeStatus(status) {
  return Object.values(LEARNING_STATUSES).includes(status)
    ? status
    : LEARNING_STATUSES.NOT_STARTED;
}

export function statusLabel(status) {
  const labels = {
    [LEARNING_STATUSES.NOT_STARTED]: 'Not Started',
    [LEARNING_STATUSES.LEARNING]: 'Learning',
    [LEARNING_STATUSES.NEEDS_REVISION]: 'Needs Revision',
    [LEARNING_STATUSES.MASTERED]: 'Mastered',
  };
  return labels[normalizeStatus(status)];
}

export function statusClass(status) {
  const classes = {
    [LEARNING_STATUSES.NOT_STARTED]: 'border-slate-300 bg-slate-100 text-slate-700',
    [LEARNING_STATUSES.LEARNING]: 'border-blue-300 bg-blue-50 text-blue-700',
    [LEARNING_STATUSES.NEEDS_REVISION]: 'border-amber-300 bg-amber-50 text-amber-700',
    [LEARNING_STATUSES.MASTERED]: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  };
  return classes[normalizeStatus(status)];
}

export function computeProgress(nodes) {
  const counts = {
    total: nodes.length,
    notStarted: 0,
    learning: 0,
    needsRevision: 0,
    mastered: 0,
    completion: 0,
  };

  nodes.forEach((node) => {
    const status = normalizeStatus(node.data?.learningStatus);
    if (status === LEARNING_STATUSES.LEARNING) counts.learning += 1;
    else if (status === LEARNING_STATUSES.NEEDS_REVISION) counts.needsRevision += 1;
    else if (status === LEARNING_STATUSES.MASTERED) counts.mastered += 1;
    else counts.notStarted += 1;
  });

  counts.completion = counts.total
    ? Math.round((counts.mastered / counts.total) * 100)
    : 0;
  return counts;
}

export function updateNodeStatus(nodes, nodeId, learningStatus) {
  return nodes.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: {
            ...node.data,
            learningStatus: normalizeStatus(learningStatus),
          },
        }
      : node
  );
}

export function getRecommendedNextNode(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const learningOrder = [...nodes].sort(
    (a, b) => (a.data?.learningOrder ?? 999) - (b.data?.learningOrder ?? 999)
  );

  const highRevision = learningOrder.find(
    (node) =>
      normalizeStatus(node.data?.learningStatus) === LEARNING_STATUSES.NEEDS_REVISION &&
      node.data?.revisionPriority === 'high'
  );
  if (highRevision) return highRevision;

  const ready = learningOrder.find((node) => {
    if (normalizeStatus(node.data?.learningStatus) !== LEARNING_STATUSES.NOT_STARTED) {
      return false;
    }
    const prereqs = node.data?.prerequisites || [];
    return prereqs.every(
      (id) => normalizeStatus(byId.get(String(id))?.data?.learningStatus) === LEARNING_STATUSES.MASTERED
    );
  });
  if (ready) return ready;

  return learningOrder.find(
    (node) => normalizeStatus(node.data?.learningStatus) === LEARNING_STATUSES.NOT_STARTED
  );
}

export function makeCacheKey(topic, settings) {
  return [
    topic.trim().toLowerCase(),
    settings.difficulty,
    settings.learningGoal,
    settings.timeAvailable,
  ]
    .join('|')
    .replace(/\s+/g, ' ');
}

export function getCachedMap(topic, settings) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAP_CACHE);
    const cache = raw ? JSON.parse(raw) : {};
    return cache[makeCacheKey(topic, settings)] || null;
  } catch {
    return null;
  }
}

export function setCachedMap(topic, settings, data) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAP_CACHE);
    const cache = raw ? JSON.parse(raw) : {};
    cache[makeCacheKey(topic, settings)] = {
      ...data,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.MAP_CACHE, JSON.stringify(cache));
  } catch {
    /* localStorage may be full or unavailable */
  }
}

export function makeImageCacheKey(attachment) {
  return [
    attachment.fileName,
    attachment.fileSize,
    attachment.lastModified || '',
  ].join('|');
}

export function getCachedImageAnalysis(attachment) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGE_ANALYSIS_CACHE);
    const cache = raw ? JSON.parse(raw) : {};
    return cache[makeImageCacheKey(attachment)] || null;
  } catch {
    return null;
  }
}

export function setCachedImageAnalysis(attachment, result) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGE_ANALYSIS_CACHE);
    const cache = raw ? JSON.parse(raw) : {};
    cache[makeImageCacheKey(attachment)] = {
      ...result,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.IMAGE_ANALYSIS_CACHE, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}
