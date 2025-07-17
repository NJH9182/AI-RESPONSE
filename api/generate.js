// /api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    businessName,
    businessType,
    ownerName,
    responseStyle,
    businessInfo,
    customerName,
    reviewText,
    reviewPlatform,
    rating,
    responseLength = "medium", // optional field
    language = "English"       // optional field
  } = req.body;

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  const prompt = `
You are a helpful assistant that writes professional responses to customer reviews.

Business Name: ${businessName}
Business Type: ${businessType}
Owner/Manager Name: ${ownerName || "the owner"}
Response Style: ${responseStyle}
Additional Info: ${businessInfo || "N/A"}
Customer Name: ${customerName || "Customer"}
Review Platform: ${reviewPlatform}
Star Rating: ${rating} star(s)
Language: ${language}
Preferred Response Length: ${responseLength}

Customer Review:
"""
${reviewText}
"""

Generate a thoughtful and tailored response in ${language}, in a ${responseStyle} tone.
Keep the length ${responseLength}.
  `;

  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a customer review response assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await apiRes.json();

    if (apiRes.ok && data.choices?.[0]?.message?.content) {
      return res.status(200).json({ response: data.choices[0].message.content.trim() });
    } else {
   console.error('OpenAI API Error:', JSON.stringify(data, null, 2));
return res.status(500).json({
  error: data?.error?.message || 'Failed to generate response from OpenAI.',
  details: data
});
;
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
