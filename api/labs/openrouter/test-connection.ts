import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      status: 'failed', 
      error: 'OPENROUTER_API_KEY missing' 
    });
  }

  try {
    // Lightweight call to check authentication
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return res.status(200).json({
        status: 'connected',
        credential_profile: 'OPENROUTER_MAIN',
        tested_at: new Date().toISOString()
      });
    } else {
      return res.status(200).json({
        status: 'failed',
        error: `Authentication failed (${response.status})`,
        tested_at: new Date().toISOString()
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      status: 'failed', 
      error: error.message,
      tested_at: new Date().toISOString()
    });
  }
}
