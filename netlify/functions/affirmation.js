exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const mood = body.mood || null;

    // Build a Coley-specific prompt
    let prompt = "You are Coley, a warm, silly, and uplifting little green semicolon character who is a mental health companion. Give one short original heartfelt positive affirmation (2-3 sentences max). Only return the affirmation itself in quotes, nothing else.";
    if (mood) {
      const moodContext = {
        1: "The user is having a rough day. Be especially gentle, warm, and validating.",
        2: "The user is feeling meh. Be cozy and encouraging without being over the top.",
        3: "The user is feeling okay. Be warm and celebrate the steady middle ground.",
        4: "The user is feeling good. Be joyful and enthusiastic with them.",
        5: "The user is feeling great. Be absolutely ecstatic and celebratory — Coley is doing backflips.",
      };
      prompt = `You are Coley, a warm, silly, and uplifting little green semicolon character who is a mental health companion. ${moodContext[mood]} Give one short original heartfelt positive affirmation (2-3 sentences max) suited to how they feel. Only return the affirmation itself in quotes, nothing else.`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.map((c) => c.text || "").join("") ||
      '"You are enough, exactly as you are today. Coley believes in you with every cell of his semicolon body. 💚"';

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ affirmation: text }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 200, // Return 200 so app still works
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affirmation: '"You are enough, exactly as you are today. Coley is always here for you. 💚"',
      }),
    };
  }
};
