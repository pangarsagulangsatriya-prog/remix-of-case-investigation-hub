import { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import { supabase } from '../../../src/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const audioFile: any = Array.isArray(files.audio_file) ? files.audio_file[0] : files.audio_file;
    const model_slug: any = fields.model_slug?.[0] || fields.model_slug;
    const system_prompt: any = fields.system_prompt?.[0] || fields.system_prompt;
    const user_prompt: any = fields.user_prompt?.[0] || fields.user_prompt;
    const output_contract: any = fields.output_contract_json_schema?.[0] || fields.output_contract_json_schema;
    const ui_mapping: any = fields.ui_mapping_json?.[0] || fields.ui_mapping_json;
    const temperature: any = parseFloat(fields.temperature?.[0] || fields.temperature || '0.2');
    
    if (!audioFile) return res.status(400).json({ error: 'No audio file provided' });
    if (!model_slug) return res.status(400).json({ error: 'No model selected' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY missing' });

    try {
      // 1. Read audio file and convert to base64
      const audioBuffer = fs.readFileSync(audioFile.filepath);
      const audioBase64 = audioBuffer.toString('base64');
      const audioFormat = audioFile.mimetype || 'audio/mpeg';

      const startTime = Date.now();

      // 2. Prepare OpenRouter Payload
      const payload = {
        model: model_slug,
        messages: [
          { role: 'system', content: system_prompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: user_prompt },
              {
                type: 'input_audio',
                input_audio: {
                  data: audioBase64,
                  format: audioFormat.includes('wav') ? 'wav' : 'mp3' // OpenRouter expects mp3 or wav
                }
              }
            ]
          }
        ],
        provider: {
          allow_fallbacks: fields.allow_fallbacks?.[0] === 'true',
          require_parameters: fields.require_parameters?.[0] === 'true'
        },
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'audio_extraction_result',
            strict: true,
            schema: JSON.parse(output_contract)
          }
        },
        temperature: temperature,
        stream: false
      };

      // 3. Call OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://berau-coal-investigation-hub.vercel.app',
          'X-Title': 'Berau Coal Investigation Hub'
        },
        body: JSON.stringify(payload)
      });

      const latency = Date.now() - startTime;
      const rawResult: any = await response.json();

      if (!response.ok) {
        throw new Error(rawResult.error?.message || `OpenRouter Error: ${response.status}`);
      }

      const content = rawResult.choices[0].message.content;
      let parsedOutput = {};
      let validationResult = { valid: true, errors: [] as string[] };

      // 4. Parse and Validate JSON
      try {
        parsedOutput = JSON.parse(content);
        // Simple schema validation simulation (in production use a library like Ajv)
        // For now, we assume success if JSON parses, but could add more logic
      } catch (e) {
        validationResult = { valid: false, errors: ['Failed to parse JSON response'] };
      }

      // 5. Save to Database (using supabase client)
      const { data: runData, error: dbError } = await supabase.from('labs_agent_runs').insert({
        gateway: 'openrouter',
        credential_profile: 'OPENROUTER_MAIN',
        model_slug: model_slug,
        uploaded_audio_name: audioFile.originalFilename,
        uploaded_audio_format: audioFormat,
        uploaded_audio_size: audioFile.size,
        prompt_payload_json: payload,
        openrouter_response_json: rawResult,
        parsed_output_json: parsedOutput,
        validation_result_json: validationResult,
        latency_ms: latency,
        usage_json: rawResult.usage,
        estimated_cost: rawResult.usage?.total_cost || 0, // OpenRouter usually provides this
        status: validationResult.valid ? 'success' : 'partial'
      }).select().single();

      return res.status(200).json({
        run_id: runData?.id,
        parsed_output: parsedOutput,
        validation: validationResult,
        raw_response: rawResult,
        latency: latency,
        usage: rawResult.usage,
        cost: rawResult.usage?.total_cost || 0
      });

    } catch (error: any) {
      console.error('Extraction Run Error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}
