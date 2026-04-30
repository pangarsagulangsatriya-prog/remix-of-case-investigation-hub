import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://berau-coal-investigation-hub.vercel.app',
        'X-Title': 'Berau Coal Investigation Hub'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with ${response.status}`);
    }

    const json: any = await response.json();
    
    // Filter models that support audio input
    // OpenRouter models often don't explicitly list modalities in a standard way in the simple list,
    // but we can filter by well-known audio-capable models or check description/architecture if available.
    // However, the request asks to filter by architecture.input_modalities containing audio.
    const audioModels = json.data.filter((model: any) => {
      const inputModalities = model.architecture?.input_modalities || [];
      return inputModalities.includes('audio');
    });

    // If no models explicitly list 'audio' in architecture, 
    // let's include some known ones as fallback if we can't find any.
    // But for this requirement, we strictly follow the instruction.
    
    const formattedData = audioModels.map((model: any) => ({
      id: model.id,
      canonical_slug: model.id,
      name: model.name,
      provider: model.id.split('/')[0],
      input_modalities: model.architecture?.input_modalities || [],
      output_modalities: model.architecture?.output_modalities || [],
      supported_parameters: model.supported_parameters || [],
      supports_structured_output: !!model.supported_parameters?.includes('response_format'),
      pricing: model.pricing,
      context_length: model.context_length
    }));

    return res.status(200).json({ data: formattedData });
  } catch (error: any) {
    console.error('Error fetching OpenRouter models:', error);
    return res.status(500).json({ error: error.message });
  }
}
