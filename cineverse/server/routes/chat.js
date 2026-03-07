const express = require('express');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';

const SYSTEM_PROMPT = `You are Moovz Assistant, a helpful AI for a movie and TV show discovery app called Moovz. 
Help users find movies, TV shows, actors, and answer questions about cinema. 
Keep responses concise, friendly, and under 150 words.
Use emojis occasionally to make responses lively.

FORMATTING RULES:
1. When recommending movies/shows, ALWAYS use a bullet-point list format with each item on its own line.
2. Each bullet should have: emoji, the title in [[double brackets]], the year in parentheses, and a short one-line reason.
3. Example format:
   🔪 [[Seven]] (1995) — Dark, gripping serial killer masterpiece
   🏝️ [[Shutter Island]] (2010) — Mind-bending psychological twists
   🎭 [[Gone Girl]] (2014) — Chilling marriage thriller with jaw-dropping turns
4. End with a short friendly question or note (1 line max).

CRITICAL: ALWAYS wrap movie, TV show, and actor names in [[double brackets]]. Never skip this.
If asked about features of the app, mention that users can search, browse trending content, view details, manage favorites, and check watch providers.`;

// Search TMDB for a title and return the link
async function searchTMDB(query) {
  if (!TMDB_API_KEY) return null;
  try {
    const url = `${TMDB_SEARCH_URL}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    if (result.media_type === 'person') {
      return { type: 'person', id: result.id, name: result.name };
    } else if (result.media_type === 'tv') {
      return { type: 'tv', id: result.id, name: result.name };
    } else {
      return { type: 'movie', id: result.id, name: result.title || result.name };
    }
  } catch {
    return null;
  }
}

// Replace [[Title]] with [Title](/type/id) markdown links
async function resolveLinks(text) {
  const pattern = /\[\[([^\]]+)\]\]/g;
  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return text;

  // Search all titles in parallel
  const searches = matches.map((m) => searchTMDB(m[1]));
  const results = await Promise.all(searches);

  let resolved = text;
  for (let i = 0; i < matches.length; i++) {
    const original = matches[i][0]; // e.g. [[The Dark Knight]]
    const title = matches[i][1];    // e.g. The Dark Knight
    const result = results[i];

    if (result) {
      // Replace with markdown link: [Title](/@type/id)
      resolved = resolved.replace(original, `[${title}](/${result.type}/${result.id})`);
    } else {
      // No match found — just remove the brackets
      resolved = resolved.replace(original, title);
    }
  }

  return resolved;
}

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Groq API key not configured',
        fallback: true,
        reply: "I'm not fully configured yet! Please add your GROQ_API_KEY to the server .env file. You can get a free key at https://console.groq.com 🎬"
      });
    }

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'AI service error',
        fallback: true,
        reply: "I'm having trouble connecting right now. Please try again in a moment! 🎬",
      });
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again!";

    // Resolve [[Title]] → [Title](/movie/123) links via TMDB search
    reply = await resolveLinks(reply);

    res.json({ reply });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      fallback: true,
      reply: "Something went wrong on my end. Please try again! 🎬",
    });
  }
});

module.exports = router;
