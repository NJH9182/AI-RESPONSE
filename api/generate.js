// Smart prompt builder function
function generatePrompt({
  businessName,
  businessType,
  ownerName,
  responseStyle,
  businessInfo,
  customerName,
  reviewText,
  reviewPlatform,
  rating
}) {
  let toneInstruction = '';
  if (rating >= 4) {
    toneInstruction = 'Express gratitude for the positive feedback.';
  } else if (rating === 3) {
    toneInstruction = 'Thank the customer and acknowledge opportunities for improvement.';
  } else {
    toneInstruction = 'Apologize sincerely and express a willingness to improve. Address any concerns if mentioned.';
  }

  return `
You are an AI assistant that writes personalized responses to customer reviews for a ${businessType} called "${businessName}".
The business owner is ${ownerName || 'the manager'}, and the review was left on ${reviewPlatform}.

Write a ${responseStyle} response to this ${rating}-star review from ${customerName || 'a customer'}.

Business background: ${businessInfo || 'N/A'}
Review text:
"${reviewText}"

Instructions:
- ${toneInstruction}
- Use clear and natural language.
- Keep the response professional but aligned with the tone.
- Sign off with: "${ownerName || 'Management'} from ${businessName}"
  `;
}

// Main API handler
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
    rating
  } = req.body;

  const prompt = generatePrompt({
    businessName,
    businessType,
    ownerName,
    responseStyle,
    businessInfo,
    customerName,
    reviewText,
    reviewPlatform,
    rating
  });

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-4' if available
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok || data.error) {
      const msg = data.error?.message || 'Unexpected error from OpenAI';
      console.error('OpenAI error:', msg);
      return res.status(500).json({ response: `OpenAI Error: ${msg}` });
    }

    const message = data.choices?.[0]?.message?.content;
    if (!message) {
      return res.status(500).json({ response: 'AI response not available (empty message).' });
    }

    return res.status(200).json({ response: message.trim() });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ response: 'Server error while generating response.' });
  }
}
