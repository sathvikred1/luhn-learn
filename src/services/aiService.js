// LLM API call logic + prompt engineering for Google Gemini.
// All requests go directly to the Gemini generateContent endpoint via fetch.
// Config (key/model/baseUrl) is read at call-time from configService so the
// user can change it in the top bar without a restart.

import { getApiConfig, hasValidKey } from './configService';

// Maps a non-OK Gemini response to a clear, actionable message. `detail` is
// Gemini's own error.message (when present); `model` helps the 404 case.
function messageForStatus(status, detail, model) {
  const lower = (detail || '').toLowerCase();
  switch (status) {
    case 400:
      if (lower.includes('api key not valid') || lower.includes('api_key_invalid')) {
        return 'Invalid Gemini API key — check the key in the top bar.';
      }
      return `Request rejected by Gemini${detail ? `: ${detail}` : '.'}`;
    case 401:
    case 403:
      return 'Access denied — your API key may be invalid or lack permission for this model.';
    case 404:
      return `Model "${model}" not found or not available for this key — pick another model in the top bar.`;
    case 429:
      return 'Rate limit / quota exceeded — wait a moment or check your Gemini quota.';
    default:
      if (status >= 500) return 'Gemini service error — please try again.';
      return `Gemini request failed (${status})${detail ? `: ${detail}` : ''}`;
  }
}

// Core call: sends a prompt expecting a JSON response, returns parsed object.
async function callGemini(prompt, { temperature = 0.7 } = {}) {
  return callGeminiParts([{ text: prompt }], { temperature });
}

async function callGeminiParts(parts, { temperature = 0.7 } = {}) {
  const { apiKey, model, baseUrl } = getApiConfig();

  if (!hasValidKey({ apiKey })) {
    throw new Error('No Gemini API key set — add your key in the top bar.');
  }

  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
  };

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch throws (TypeError) on network failure / CORS / offline.
    throw new Error('Network error — check your connection and try again.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message || '';
    } catch {
      /* ignore */
    }
    throw new Error(messageForStatus(res.status, detail, model));
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response. Try again or switch models.');
  }

  return parseJsonLoose(text);
}

// Robust JSON parse: handles raw JSON and ```json fenced blocks.
function parseJsonLoose(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Last resort: extract the first {...} or [...] block.
    const match = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Could not parse AI response as JSON.');
  }
}

// ---------------------------------------------------------------------------
// Prompt 1: Generate initial map
// ---------------------------------------------------------------------------
export async function generateMap(topic, settings = {}) {
  const difficulty = settings.difficulty || 'Beginner';
  const learningGoal = settings.learningGoal || 'Understand basics';
  const timeAvailable = settings.timeAvailable || '30 min';

  const prompt = `You are an expert teacher and knowledge graph designer. Generate a concise learning map for "${topic}".

Learner settings:
- Difficulty mode: ${difficulty}
- Learning goal: ${learningGoal}
- Time available: ${timeAvailable}

Adapt the map:
- Beginner: simpler concepts, plain language, useful analogies.
- Intermediate: practical links and core tradeoffs.
- Advanced: deeper technical relationships and edge cases.
- Exam Mode: definitions, comparisons, formulas when relevant, quiz-ready concepts.
- Interview Mode: practical questions, tradeoffs, mistakes, and real-world usage.
- Project building: implementation flow, tools, decisions, and build order.
- Quick revision / short time: prioritize essentials and high-yield concepts.

Return ONLY valid JSON with this exact structure:
{
  "nodes": [
    {
      "id": "1",
      "title": "Main Topic",
      "summary": "short explanation under 40 words",
      "analogy": "simple analogy under 30 words",
      "example": "simple example under 30 words",
      "whyItMatters": "short reason",
      "commonMistake": "one common misunderstanding",
      "prerequisites": [],
      "difficulty": "Beginner",
      "learningStatus": "not_started",
      "revisionPriority": "high",
      "depth": 0,
      "flashcards": [{ "front": "question", "back": "answer" }],
      "quiz": [{
        "type": "mcq",
        "question": "question text",
        "options": ["A", "B", "C", "D"],
        "answer": "correct option text",
        "explanation": "short explanation"
      }]
    }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "relationship label", "description": "Brief explanation" }
  ],
  "learningOrder": ["1", "2"]
}
Rules:
- Node "1" must be "${topic}" at depth 0.
- Generate 7-10 total nodes.
- Use string ids. Edge ids are not needed.
- Every node needs 1 flashcard and 1 MCQ quiz question.
- Keep all generated text concise.
- prerequisites must contain node ids only.
- learningStatus must always be "not_started".
- revisionPriority must be "low", "medium", or "high".
- Edges must use valid node ids and meaningful labels.`;

  return callGemini(prompt);
}

// ---------------------------------------------------------------------------
// Prompt 2: Expand a node
// ---------------------------------------------------------------------------
export async function expandNode(nodeLabel, parentTopic, parentDepth, parentId) {
  const childDepth = parentDepth + 1;
  const prompt = `Expand the concept "${nodeLabel}" which is a sub-topic of "${parentTopic}". Generate 3 related sub-concepts with concise study content. Return JSON:
{
  "nodes": [
    {
      "id": "temp_1",
      "title": "New Concept",
      "summary": "under 40 words",
      "analogy": "under 30 words",
      "example": "under 30 words",
      "whyItMatters": "short reason",
      "commonMistake": "one mistake",
      "prerequisites": ["${parentId}"],
      "difficulty": "Intermediate",
      "learningStatus": "not_started",
      "revisionPriority": "medium",
      "depth": ${childDepth},
      "flashcards": [{ "front": "question", "back": "answer" }],
      "quiz": [{ "type": "mcq", "question": "question", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "why" }]
    }
  ],
  "edges": [
    { "source": "${parentId}", "target": "temp_1", "label": "relationship", "description": "Brief explanation" }
  ]
}
Each new node must use a "temp_" id (temp_1, temp_2, ...) at depth ${childDepth}. Every edge's source must be "${parentId}" (the parent) and target a temp id. Use meaningful, specific relationship labels. Return ONLY valid JSON.`;

  return callGemini(prompt);
}

// ---------------------------------------------------------------------------
// Prompt 3: Node details
// ---------------------------------------------------------------------------
export async function getNodeDetails(conceptLabel, rootTopic) {
  const prompt = `Provide a concise 2-3 sentence educational summary of "${conceptLabel}" in the context of "${rootTopic}". Return JSON:
{
  "summary": "...",
  "wikipediaUrl": "https://en.wikipedia.org/wiki/...",
  "imageQuery": "search term for finding an image"
}
Return ONLY valid JSON.`;

  return callGemini(prompt, { temperature: 0.4 });
}

// ---------------------------------------------------------------------------
// Prompt 4: Edge description
// ---------------------------------------------------------------------------
export async function getEdgeDescription(sourceLabel, targetLabel, edgeLabel) {
  const prompt = `Explain the relationship "${edgeLabel}" between "${sourceLabel}" and "${targetLabel}". Return JSON:
{
  "description": "2-3 sentence explanation of how these concepts are related through this relationship."
}
Return ONLY valid JSON.`;

  return callGemini(prompt, { temperature: 0.4 });
}

// ---------------------------------------------------------------------------
// Wikipedia image + summary fetch (REST API, not the LLM)
// ---------------------------------------------------------------------------
export async function fetchWikipediaImage(conceptName) {
  try {
    const title = encodeURIComponent(conceptName.trim());
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return {
      thumbnail: json?.thumbnail?.source || null,
      extract: json?.extract || null,
      url: json?.content_urls?.desktop?.page || null,
    };
  } catch {
    return null;
  }
}

export async function analyzeImageAttachment(attachment) {
  const [, base64 = ''] = (attachment.localUrl || '').split(',');
  if (!base64) throw new Error('Image data is unavailable.');

  const prompt = `Analyze this learning image. Extract visible text, key concepts, definitions, relationships, possible concept-map nodes, and a short summary.
Return ONLY valid JSON:
{
  "extractedText": "...",
  "summary": "...",
  "keyConcepts": ["..."],
  "suggestedNodes": [
    { "title": "...", "summary": "...", "sourceImageId": "${attachment.id}" }
  ],
  "suggestedEdges": [
    { "sourceTitle": "...", "targetTitle": "...", "label": "..." }
  ]
}
Keep suggestions concise. Do not invent details that are not visible or strongly implied.`;

  return callGeminiParts(
    [
      { text: prompt },
      {
        inlineData: {
          mimeType: attachment.fileType,
          data: base64,
        },
      },
    ],
    { temperature: 0.25 }
  );
}

export async function generateFromNote(note, context) {
  const prompt = `Use this student note to suggest additions to the current learning map.

Current topic: ${context.topic}
Existing nodes: ${context.nodes.map((n) => n.data.label).join(', ')}
Note text:
${note.text}

Return ONLY valid JSON:
{
  "suggestedNodes": [
    {
      "title": "...",
      "summary": "...",
      "sourceNoteId": "${note.id}",
      "flashcards": [{ "front": "question", "back": "answer" }],
      "quiz": [{ "type": "mcq", "question": "question", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "why" }]
    }
  ],
  "suggestedEdges": [
    { "sourceTitle": "...", "targetTitle": "...", "label": "..." }
  ]
}
Suggest only concise, high-value additions.`;

  return callGemini(prompt, { temperature: 0.35 });
}
