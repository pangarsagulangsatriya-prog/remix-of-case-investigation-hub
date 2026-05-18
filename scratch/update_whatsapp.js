import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parser
function parseEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || '';
        val = val.trim();
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    });
  } catch (e) {
    // Ignore if file doesn't exist
  }
}

parseEnv(path.resolve(process.cwd(), '.env'));
parseEnv(path.resolve(process.cwd(), '.env.local'));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('evidence_files')
    .select('*')
    .ilike('name', '%WhatsApp Image%');
    
  if (error) {
    console.error('Error fetching file:', error);
    return;
  }
  
  if (data && data.length > 0) {
    const file = data[0];
    const newMetadata = {
      ...file.metadata,
      error_message: "Failed to upload evidence payload. Connection lost during chunk upload (408)."
    };
    
    const { error: updateError } = await supabase
      .from('evidence_files')
      .update({
        extraction_status: 'failed',
        metadata: newMetadata
      })
      .eq('id', file.id);
      
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Successfully updated file:', file.name, 'to failed state with uploading error.');
    }
  } else {
    console.log('File not found');
  }
}

main();
