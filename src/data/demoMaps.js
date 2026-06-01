const demoTopics = {
  'Machine Learning': [
    ['1', 'Machine Learning', [], 'high'],
    ['2', 'Training Data', ['1'], 'high'],
    ['3', 'Models', ['2'], 'high'],
    ['4', 'Supervised Learning', ['2', '3'], 'medium'],
    ['5', 'Evaluation Metrics', ['3'], 'high'],
    ['6', 'Overfitting', ['3', '5'], 'high'],
    ['7', 'Deployment', ['5'], 'medium'],
  ],
  React: [
    ['1', 'React', [], 'high'],
    ['2', 'Components', ['1'], 'high'],
    ['3', 'Props', ['2'], 'high'],
    ['4', 'State', ['2'], 'high'],
    ['5', 'Hooks', ['4'], 'high'],
    ['6', 'Rendering', ['3', '4'], 'medium'],
    ['7', 'Routing', ['2'], 'medium'],
  ],
  Cybersecurity: [
    ['1', 'Cybersecurity', [], 'high'],
    ['2', 'Threats', ['1'], 'high'],
    ['3', 'Authentication', ['1'], 'high'],
    ['4', 'Encryption', ['1'], 'high'],
    ['5', 'Network Security', ['2'], 'medium'],
    ['6', 'Incident Response', ['2', '5'], 'high'],
    ['7', 'Security Awareness', ['1'], 'medium'],
  ],
  Photosynthesis: [
    ['1', 'Photosynthesis', [], 'high'],
    ['2', 'Chloroplasts', ['1'], 'high'],
    ['3', 'Light Reactions', ['2'], 'high'],
    ['4', 'Calvin Cycle', ['3'], 'high'],
    ['5', 'Glucose', ['4'], 'medium'],
    ['6', 'Oxygen Release', ['3'], 'medium'],
    ['7', 'Limiting Factors', ['1'], 'medium'],
  ],
  'French Revolution': [
    ['1', 'French Revolution', [], 'high'],
    ['2', 'Old Regime', ['1'], 'high'],
    ['3', 'Estates General', ['2'], 'medium'],
    ['4', 'National Assembly', ['3'], 'high'],
    ['5', 'Reign of Terror', ['4'], 'high'],
    ['6', 'Napoleon', ['5'], 'medium'],
    ['7', 'Rights of Man', ['4'], 'high'],
  ],
};

function node([id, title, prerequisites, revisionPriority], index) {
  return {
    id,
    title,
    summary: `${title} is a key idea in this topic. Learn what it means, how it connects, and when to use it.`,
    analogy: `${title} is like one part of a larger learning machine.`,
    example: `Example: explain ${title} in one clear sentence.`,
    whyItMatters: `It helps you understand the topic instead of memorizing isolated facts.`,
    commonMistake: `Treating ${title} as separate from the surrounding concepts.`,
    prerequisites,
    difficulty: index < 3 ? 'Beginner' : index < 5 ? 'Intermediate' : 'Advanced',
    learningStatus: 'not_started',
    revisionPriority,
    flashcards: [
      {
        front: `What is ${title}?`,
        back: `${title} is a core concept that connects to the rest of the map.`,
      },
    ],
    quiz: [
      {
        type: 'mcq',
        question: `Why is ${title} important?`,
        options: [
          'It connects ideas in the topic',
          'It is unrelated trivia',
          'It replaces all prerequisites',
          'It only matters for definitions',
        ],
        answer: 'It connects ideas in the topic',
        explanation: `${title} matters because it links meaning, usage, and relationships.`,
      },
    ],
  };
}

function buildDemoMap(topic) {
  const baseNodes = demoTopics[topic].map(node);
  return {
    topic,
    learningOrder: baseNodes.map((n) => n.id),
    nodes: baseNodes,
    edges: baseNodes
      .filter((n) => n.id !== '1')
      .map((n) => ({
        source: n.prerequisites[0] || '1',
        target: n.id,
        label: 'leads to',
        description: `${n.prerequisites[0] || topic} helps explain ${n.title}.`,
      })),
  };
}

export const DEMO_MAPS = Object.fromEntries(
  Object.keys(demoTopics).map((topic) => [topic, buildDemoMap(topic)])
);

export function getClosestDemoMap(topic = '') {
  const query = topic.toLowerCase();
  const exact = Object.keys(DEMO_MAPS).find((name) => query.includes(name.toLowerCase()));
  if (exact) return DEMO_MAPS[exact];

  if (query.includes('react') || query.includes('javascript')) return DEMO_MAPS.React;
  if (query.includes('security') || query.includes('cyber')) return DEMO_MAPS.Cybersecurity;
  if (query.includes('plant') || query.includes('photo')) return DEMO_MAPS.Photosynthesis;
  if (query.includes('france') || query.includes('revolution')) return DEMO_MAPS['French Revolution'];
  return DEMO_MAPS['Machine Learning'];
}
