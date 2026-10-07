import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  TerminalSquare, 
  Key, 
  Play, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Settings2,
  ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type TabType = 'curl' | 'js' | 'python';
type MethodTabType = 'id' | 'file';
type TestState = 'idle' | 'loading' | 'success' | 'error';
type TestMethod = 'id' | 'file';

export function QuestionBankApiMode() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [codeTab, setCodeTab] = useState<TabType>('curl');
  const [methodTab, setMethodTab] = useState<MethodTabType>('id');
  
  // API Tester
  const [testMethod, setTestMethod] = useState<TestMethod>('id');
  const [testId, setTestId] = useState('');
  const [testState, setTestState] = useState<TestState>('idle');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  
  // API Keys (Mocked UI)
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  
  const [keys, setKeys] = useState([
    { id: 'k1', name: 'SAP Safety', env: 'Production', lastUsed: '10:42', status: 'Active', hint: 'qb_live_••••42f8' },
    { id: 'k2', name: 'Question Bank Demo', env: 'Sandbox', lastUsed: '09:16', status: 'Active', hint: 'qb_test_••••44A2' },
    { id: 'k3', name: 'Legacy Test', env: 'Sandbox', lastUsed: '—', status: 'Revoked', hint: 'qb_test_••••1A9B' },
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const handleTestApi = () => {
    setTestState('loading');
    
    setTimeout(() => {
      if (testMethod === 'id') {
        const query = testId.trim().toUpperCase();
        if (query === '323' || query === 'INC-323' || query === 'LPI-323') {
          setTestStatus(200);
          setTestResponse({
            request_id: `req_${Math.random().toString(36).substring(2, 9)}`,
            status: "completed",
            source: { type: "lpi", id: query },
            questions: [
              { id: "q_01", question: "Kapan kejadian berlangsung?" },
              { id: "q_02", question: "Aktivitas apa yang sedang dilakukan sebelum kejadian?" }
            ]
          });
          setTestState('success');
        } else if (query === '401') {
          setTestStatus(401);
          setTestResponse({
            error: "Unauthorized",
            message: "API key tidak valid atau sudah tidak aktif."
          });
          setTestState('error');
        } else {
          setTestStatus(404);
          setTestResponse({
            error: "Document Not Found",
            message: "LPI document not found for the provided ID."
          });
          setTestState('error');
        }
      } else {
        // File mock
        setTestStatus(200);
        setTestResponse({
          request_id: `req_${Math.random().toString(36).substring(2, 9)}`,
          status: "completed",
          source: { type: "file", filename: "report.pdf" },
          questions: [
            { id: "q_01", question: "Kapan kejadian berlangsung?" }
          ]
        });
        setTestState('success');
      }
    }, 1200);
  };

  const handleCreateKey = () => {
    const keyStr = `qb_test_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
    setNewKey(keyStr);
    setKeys([
      { id: `k${Date.now()}`, name: 'New API Client', env: 'Sandbox', lastUsed: '—', status: 'Active', hint: `${keyStr.substring(0, 12)}••••` },
      ...keys
    ]);
  };

  const confirmRevoke = () => {
    setKeys(keys.map(k => k.id === keyToRevoke ? { ...k, status: 'Revoked' } : k));
    setShowRevokeConfirm(false);
    setKeyToRevoke(null);
  };

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* LEFT: DOCUMENTATION */}
      <div className="w-full md:w-[55%] flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-10">
        
        {/* Status Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">API Info & Status</h2>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> API Available
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Environment</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Sandbox
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Version</div>
              <div className="text-xs font-semibold text-slate-700">v1</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auth</div>
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Key className="w-3 h-3 text-slate-400" /> API Key
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-slate-400" />
            Quick Start
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { step: '01', title: 'Dapatkan API Key' },
              { step: '02', title: 'Pilih metode input' },
              { step: '03', title: 'Kirim request' },
              { step: '04', title: 'Gunakan response' }
            ].map((s) => (
              <div key={s.step} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-black text-indigo-300 mb-1">{s.step}</div>
                <div className="text-xs font-semibold text-slate-700 leading-tight">{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint & Auth */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Endpoint & Authentication</h3>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1.5">Endpoint URL</div>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-1 rounded">POST</div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-700">
                  https://api.beraucoal.co.id/api/v1/question-bank/generate
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 border-slate-200"
                  onClick={() => handleCopy('https://api.beraucoal.co.id/api/v1/question-bank/generate', 'endpoint')}
                >
                  {copiedStates['endpoint'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1.5">Authorization Header</div>
              <div className="bg-slate-900 rounded p-3 text-xs font-mono text-slate-300 flex justify-between items-start">
                <div>
                  <span className="text-pink-400">Authorization:</span> Bearer {'<API_KEY>'}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => handleCopy('Authorization: Bearer <API_KEY>', 'auth')}
                >
                  {copiedStates['auth'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded flex items-start gap-2 border border-amber-100">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Simpan API Key di secret manager. Jangan menaruh key di source code atau client-side application.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Tutorial & Code */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-2">
            <div className="flex gap-1">
              <button onClick={() => setMethodTab('id')} className={cn("px-4 py-3 text-xs font-bold border-b-2 transition-colors", methodTab === 'id' ? "border-indigo-500 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700")}>
                Method: LPI ID
              </button>
              <button onClick={() => setMethodTab('file')} className={cn("px-4 py-3 text-xs font-bold border-b-2 transition-colors", methodTab === 'file' ? "border-indigo-500 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700")}>
                Method: File Upload
              </button>
            </div>
          </div>
          
          <div className="p-5">
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {methodTab === 'id' 
                ? "Gunakan ID investigasi yang sudah ada di sistem. Sistem akan otomatis mencari dokumen PDF yang terkait dengan ID tersebut."
                : "Kirim dokumen PDF LPI secara langsung menggunakan multipart/form-data."}
            </p>
            
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between px-2 bg-slate-950 border-b border-slate-800">
                <div className="flex">
                  <button onClick={() => setCodeTab('curl')} className={cn("px-3 py-2 text-[11px] font-bold transition-colors", codeTab === 'curl' ? "text-indigo-400" : "text-slate-500 hover:text-slate-300")}>cURL</button>
                  <button onClick={() => setCodeTab('js')} className={cn("px-3 py-2 text-[11px] font-bold transition-colors", codeTab === 'js' ? "text-yellow-400" : "text-slate-500 hover:text-slate-300")}>JavaScript</button>
                  <button onClick={() => setCodeTab('python')} className={cn("px-3 py-2 text-[11px] font-bold transition-colors", codeTab === 'python' ? "text-blue-400" : "text-slate-500 hover:text-slate-300")}>Python</button>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => handleCopy('// Code example', 'code')}>
                  {copiedStates['code'] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <div className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                {codeTab === 'curl' && methodTab === 'id' && (
                  <pre>
<span className="text-indigo-400">curl</span> -X POST "https://api.beraucoal.co.id/api/v1/question-bank/generate" \<br/>
  -H <span className="text-green-300">"Authorization: Bearer &lt;API_KEY&gt;"</span> \<br/>
  -H <span className="text-green-300">"Content-Type: application/json"</span> \<br/>
  -d <span className="text-amber-300">'{'{'}"lpi_id": "LPI-323"{'}'}'</span>
                  </pre>
                )}
                {codeTab === 'curl' && methodTab === 'file' && (
                  <pre>
<span className="text-indigo-400">curl</span> -X POST "https://api.beraucoal.co.id/api/v1/question-bank/generate" \<br/>
  -H <span className="text-green-300">"Authorization: Bearer &lt;API_KEY&gt;"</span> \<br/>
  -F <span className="text-amber-300">"file=@/path/to/report.pdf"</span>
                  </pre>
                )}
                {codeTab === 'js' && (
                  <pre>
<span className="text-pink-400">const</span> response = <span className="text-pink-400">await</span> <span className="text-blue-300">fetch</span>(<span className="text-green-300">'https://api.../generate'</span>, {'{'}<br/>
  method: <span className="text-green-300">'POST'</span>,<br/>
  headers: {'{'}<br/>
    <span className="text-green-300">'Authorization'</span>: <span className="text-green-300">'Bearer &lt;API_KEY&gt;'</span>,<br/>
    <span className="text-slate-500">// ...</span><br/>
  {'}'}<br/>
{'}'});
                  </pre>
                )}
                {codeTab === 'python' && (
                  <pre>
<span className="text-pink-400">import</span> requests<br/><br/>
headers = {'{'}<span className="text-green-300">"Authorization"</span>: <span className="text-green-300">"Bearer &lt;API_KEY&gt;"</span>{'}'}<br/>
<span className="text-slate-500"># ...</span>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Governance & Access Control */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">API Governance & Access</h3>
          </div>
          
          {/* Rules */}
          <div className="p-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate Limit</div>
              <div className="text-xs font-medium text-slate-800">60 requests / minute</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Limits</div>
              <div className="text-xs font-medium text-slate-800">PDF, Max 25 MB</div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Handling</div>
              <div className="text-xs font-medium text-slate-600 leading-relaxed">
                Pastikan dokumen yang dikirim mengikuti kebijakan klasifikasi data perusahaan. Retention policy belum dikonfigurasi secara spesifik.
              </div>
            </div>
          </div>

          {/* Key Management UI (Mocked) */}
          <div className="p-5 bg-slate-50/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[11px] font-bold text-slate-700">API Keys (UI Only / Backend Required)</h4>
              <Button size="sm" onClick={() => setShowCreateKey(true)} className="h-7 text-[10px] bg-slate-900 hover:bg-slate-800 text-white">
                Buat API Key
              </Button>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-slate-500">Client</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Env</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Key</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Status</th>
                    <th className="px-3 py-2 font-semibold text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keys.map(k => (
                    <tr key={k.id} className={k.status === 'Revoked' ? 'opacity-60' : ''}>
                      <td className="px-3 py-2 font-medium text-slate-800">{k.name}</td>
                      <td className="px-3 py-2">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold", k.env === 'Production' ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700")}>
                          {k.env}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-500">{k.hint}</td>
                      <td className="px-3 py-2">
                        <span className={cn("flex items-center gap-1 text-[10px] font-semibold", k.status === 'Active' ? "text-emerald-600" : "text-slate-500")}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", k.status === 'Active' ? "bg-emerald-500" : "bg-slate-400")} />
                          {k.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {k.status === 'Active' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setKeyToRevoke(k.id); setShowRevokeConfirm(true); }}
                            className="h-6 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Audit Log (Mocked) */}
          <div className="p-5 border-t border-slate-100 bg-white">
             <h4 className="text-[11px] font-bold text-slate-700 mb-3">API Activity</h4>
             <table className="w-full text-left text-[11px]">
                <thead className="text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium">Request ID</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  <tr>
                    <td className="py-2">10:42 WIB</td>
                    <td className="py-2">SAP Safety</td>
                    <td className="py-2 font-mono text-[10px]">req_92H...</td>
                    <td className="py-2 text-emerald-600 font-medium">200</td>
                    <td className="py-2">2.4s</td>
                  </tr>
                  <tr>
                    <td className="py-2">10:31 WIB</td>
                    <td className="py-2">Demo Sandbox</td>
                    <td className="py-2 font-mono text-[10px]">req_82F...</td>
                    <td className="py-2 text-amber-600 font-medium">422</td>
                    <td className="py-2">0.3s</td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
      </div>

      {/* RIGHT: API TESTER */}
      <div className="w-full md:w-[45%] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-10 h-[calc(100vh-10rem)]">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 shrink-0">
          <TerminalSquare className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Test API Console</h2>
        </div>

        {/* Test Request Panel */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Environment</label>
                <div className="h-8 px-3 border border-slate-200 bg-slate-50 rounded flex items-center text-xs font-medium text-slate-600">
                  Sandbox
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Input Type</label>
                <select 
                  className="h-8 w-full px-2 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value as TestMethod)}
                >
                  <option value="id">LPI ID</option>
                  <option value="file">File Upload</option>
                </select>
              </div>
            </div>

            {testMethod === 'id' ? (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">LPI ID</label>
                <Input 
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  placeholder="e.g. 323"
                  className="h-8 text-xs"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Document</label>
                <Button variant="outline" className="w-full h-8 text-xs text-slate-500 font-normal border-dashed">
                  Select PDF File...
                </Button>
              </div>
            )}

            <Button 
              onClick={handleTestApi}
              disabled={testState === 'loading' || (testMethod === 'id' && !testId.trim())}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              {testState === 'loading' ? (
                <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Mengirim Request...</>
              ) : (
                <><Play className="w-3.5 h-3.5 mr-2" /> Send Request</>
              )}
            </Button>
          </div>
        </div>

        {/* Test Response Panel */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
          {testState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Play className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-xs font-medium">Click "Send Request" to test the API endpoint.<br/>Use ID <span className="font-bold text-slate-500">323</span> for a success mock or <span className="font-bold text-slate-500">401</span> for an error.</p>
            </div>
          )}

          {testState === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mb-4" />
              <div className="text-xs font-bold text-slate-700 mb-1">Processing Request</div>
              <div className="text-[10px] text-slate-500 font-mono">POST /api/v1/question-bank/generate</div>
            </div>
          )}

          {(testState === 'success' || testState === 'error') && (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-200 bg-white shrink-0 gap-2">
                <div className="flex items-center gap-3">
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", 
                    testStatus === 200 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  )}>
                    {testStatus} {testStatus === 200 ? 'OK' : testStatus === 401 ? 'Unauthorized' : 'Error'}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 1.24s
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {testResponse?.request_id || `req_fail`}
                </div>
              </div>
              
              <div className="flex-1 overflow-auto bg-slate-900 p-4 custom-scrollbar">
                <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <Dialog open={showCreateKey} onOpenChange={(open) => { if (!open) { setShowCreateKey(false); setNewKey(null); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-slate-900">API Key Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-[12px] text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-100 leading-relaxed font-medium">
              Salin API Key sekarang. Setelah dialog ditutup, key lengkap tidak akan ditampilkan kembali.
            </div>
            {newKey && (
              <div className="flex items-center gap-2">
                <Input value={newKey} readOnly className="font-mono text-xs h-9 bg-slate-50" />
                <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => handleCopy(newKey, 'newkey')}>
                  {copiedStates['newkey'] ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowCreateKey(false); setNewKey(null); }} className="w-full h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white">
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRevokeConfirm} onOpenChange={setShowRevokeConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-rose-600">Cabut akses API?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[13px] text-slate-600">
              Integrasi yang menggunakan key ini akan langsung gagal melakukan request.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRevokeConfirm(false)} className="h-9 px-4 text-xs font-semibold">
              Batal
            </Button>
            <Button onClick={confirmRevoke} className="h-9 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white">
              Cabut Akses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
