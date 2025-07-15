// api/generate.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { businessName, businessType, ownerName, responseStyle, businessInfo, customerName, reviewText, reviewPlatform, rating } = req.body;

    const prompt = `
You are an AI assistant writing review responses for a ${businessType} called "${businessName}".
Respond to the following ${rating}-star review from ${customerName || 'a customer'} left on ${reviewPlatform}.
Use a ${responseStyle} tone. Include this context: ${businessInfo || 'none'}.

Customer review:
"${reviewText}"

Sign off as: ${ownerName || 'Management'} from ${businessName}.
`;

    try {
        const completion = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        const data = await completion.json();
        const message = data.choices?.[0]?.message?.content || 'AI response not available.';
        res.status(200).json({ response: message });

    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
}
