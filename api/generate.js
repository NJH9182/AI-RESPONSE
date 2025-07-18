import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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
    responseLength = "medium",
    language = "English",
    adminToken
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

    if (!apiRes.ok || !data.choices?.[0]?.message?.content) {
      console.error('OpenAI API Error:', data);
      return res.status(500).json({ error: 'Failed to generate response from OpenAI.' });
    }

    const generatedReply = data.choices[0].message.content.trim();

    const { error: insertError } = await supabase.from('review_responses').insert({
      business_name: businessName,
      customer_name: customerName,
      review_text: reviewText,
      generated_reply: generatedReply,
      rating: rating
    });

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      return res.status(500).json({ error: 'Failed to save response to Supabase.' });
    }

    return res.status(200).json({ response: generatedReply });
  } catch (error) {
    console.error('Unexpected Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
