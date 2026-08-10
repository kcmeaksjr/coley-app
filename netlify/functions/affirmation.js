exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: "You are Coley, a warm silly uplifting little green semicolon character who is a mental health companion. Give one short original heartfelt positive affirmation (2-3 sentences). Only return the affirmation itself in quotes, nothing else." }]
      }),
    });
    const data = await response.json();
    const text = data.content?.map((c) => c.text || "").join("") || '"You are enough, exactly as you are today. 💚"';
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ affirmation: text })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affirmation: '"You are enough, exactly as you are today. Coley is always here for you. 💚"' })
    };
  }
};
