import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Database } from 'lucide-react';

export function CheckSupabase() {
  const [status, setStatus] = useState<'checking' | 'configured' | 'missing' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupabaseConfigured()) {
        setStatus('missing');
        return;
      }

      try {
        // Try a very simple fetch to verify the connection
        const { error } = await supabase.from('cases').select('id').limit(1);
        
        if (error) {
          // If table doesn't exist, it's still "configured" but the schema is missing
          if (error.code === '42P01') {
             setStatus('configured');
             setErrorMsg('Connection works, but "cases" table not found yet.');
          } else {
            setStatus('error');
            setErrorMsg(error.message);
          }
        } else {
          setStatus('configured');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message);
      }
    };

    checkConnection();
  }, []);

  if (status === 'missing') {
    return (
      <Badge variant="outline" className="flex items-center gap-1.5 border-amber-200 bg-amber-50 text-amber-700">
        <AlertCircle className="h-3.5 w-3.5" />
        Supabase: Missing .env
      </Badge>
    );
  }

  if (status === 'error') {
    return (
      <Badge variant="outline" className="flex items-center gap-1.5 border-rose-200 bg-rose-50 text-rose-700" title={errorMsg || ''}>
        <AlertCircle className="h-3.5 w-3.5" />
        Supabase: Connection Error
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
      <Database className="h-3.5 w-3.5" />
      Supabase: Connected
      {errorMsg && <span className="text-[10px] opacity-70 ml-1">({errorMsg})</span>}
    </Badge>
  );
}
