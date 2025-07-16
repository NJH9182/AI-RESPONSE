function generatePrompt({
  businessName, businessType, ownerName, responseStyle, responseLength,
  responseLanguage, businessInfo, customerName, reviewText, reviewPlatform, rating
}) {
  let tone = '';
  if (rating >= 4) tone = 'Express gratitude and positivity.';
  else if (rating === 3) tone = 'Acknowledge neutral feedback and offer improvements.';
  else tone = 'Apologize sincerely and address the issue.';

  return `You are an AI assistant that writes ${responseLength}-length customer review responses in ${responseLanguage}.
Business: ${businessName} (${businessType})
Owner: ${ownerName || 'Management'}
Platform: ${reviewPlatform}
Tone: ${responseStyle}
Instruction: ${tone}

Context: ${businessInfo || 'N/A'}
Customer: ${customerName || 'Anonymous'}
Review (${rating} stars): "${reviewText}"

Sign off as "${ownerName || 'Team'} from ${businessName}".`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const prompt = generatePrompt(req.body);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({ response: `OpenAI Error: ${data.error?.message || 'Unknown error'}` });
    }

    return res.status(200).json({ response: data.choices?.[0]?.message?.content.trim() });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ response: 'Failed to connect to OpenAI API.' });
  }
}
