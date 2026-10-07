import os

content = """import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, Key, Shield, RefreshCw, Trash2, ChevronDown, ChevronRight, Activity, Terminal, Send, Search, Clock, Zap } from 'lucide-react';

export function QuestionBankApiIntegration() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [inputMode, setInputMode] = useState<'LPI' | 'PDF'>('LPI');
  const [testLpiId, setTestLpiId] = useState('LPI-2026-09-012');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [expandedGov, setExpandedGov] = useState<string | null>('access');

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Question Bank Integration', env: 'Sandbox', created: '07 Oct 2026', lastUsed: '10:42 WIB', key: 'qb_test_••••••••••44A2', fullKey: 'qb_test_9A8F31B44A2', status: 'Active' }
  ]);
  
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<number | null>(null);

  const mockResponse = {
    "request_id": "req_92H8fK2",
    "status": "completed",
    "source": {
      "type": "lpi",
      "id": "LPI-2026-09-012"
    },
    "questions": [
      {
        "id": "q_01",
        "question": "Kapan kejadian berlangsung?"
      },
      {
        "id": "q_02",
        "question": "Siapa pengawas pekerjaan pada saat kejadian?"
      }
    ]
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSendTest = () => {
    setTestStatus('LOADING');
    setTestResponse(null);
    setTimeout(() => {
      setTestStatus('SUCCESS');
      setTestResponse(mockResponse);
    }, 2000);
  };

  const handleRevoke = (id: number) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'Revoked' } : k));
    setShowRevokeConfirm(null);
  };

  return (
    <div className="w-full flex flex-col max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank API</h2>
          <p className="text-sm text-slate-500 mt-1">Integrasikan kemampuan Question Bank langsung ke aplikasi atau workflow internal perusahaan.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider">API Available</span>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold uppercase tracking-wider">
            Sandbox Env
          </div>
          <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
            v1.0
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Documentation */}
        <div className="flex-1 w-full lg:w-[55%] flex flex-col gap-6">
          
          {/* Quick Start */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Quick Start</h3>
            </div>
            <div className="p-5 flex gap-4 overflow-x-auto custom-scrollbar">
              <div className="flex flex-col gap-2 min-w-[120px]">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded uppercase tracking-wider">01</span>
                <span className="text-xs font-semibold text-slate-800 leading-tight">Dapatkan<br/>API Key</span>
              </div>
              <div className="w-px bg-slate-200 shrink-0" />
              <div className="flex flex-col gap-2 min-w-[120px]">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded uppercase tracking-wider">02</span>
                <span className="text-xs font-semibold text-slate-800 leading-tight">Pilih tipe<br/>input dokumen</span>
              </div>
              <div className="w-px bg-slate-200 shrink-0" />
              <div className="flex flex-col gap-2 min-w-[120px]">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded uppercase tracking-wider">03</span>
                <span className="text-xs font-semibold text-slate-800 leading-tight">Kirim request<br/>generate API</span>
              </div>
              <div className="w-px bg-slate-200 shrink-0" />
              <div className="flex flex-col gap-2 min-w-[120px]">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded uppercase tracking-wider">04</span>
                <span className="text-xs font-semibold text-slate-800 leading-tight">Gunakan JSON<br/>response</span>
              </div>
            </div>
          </div>

          {/* Endpoint & Auth */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Endpoint & Authentication</h3>
            </div>
            <div className="p-5 flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">API Endpoint</span>
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1.5 rounded border border-emerald-200">POST</div>
                  <div className="flex-1 bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-800 flex items-center justify-between group">
                    <span>https://api.beraucoal.co.id/v1/question-bank/generate</span>
                    <button onClick={() => handleCopy("https://api.beraucoal.co.id/v1/question-bank/generate", "endpoint")} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      {copiedKey === 'endpoint' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Authentication</span>
                <div className="flex-1 bg-slate-100 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span>Authorization: Bearer {'<API_KEY>'}</span>
                    <button onClick={() => handleCopy("Authorization: Bearer <API_KEY>", "auth")} className="text-slate-400 hover:text-indigo-600 transition-colors">
                      {copiedKey === 'auth' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2.5 rounded flex gap-2 items-start mt-1">
                  <Shield className="w-4 h-4 shrink-0 text-amber-600" />
                  <p className="leading-relaxed">Simpan API Key di secret manager atau environment variable. Jangan menaruh key di source code atau client-side application.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-slate-300">
            <div className="bg-slate-950 border-b border-slate-800 flex items-center justify-between px-2 pt-2">
              <div className="flex gap-1">
                <button onClick={() => setActiveCodeTab('curl')} className={cn("px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-md transition-all border-b-2", activeCodeTab === 'curl' ? "border-indigo-500 text-white bg-slate-800" : "border-transparent text-slate-500 hover:text-slate-300")}>cURL</button>
                <button onClick={() => setActiveCodeTab('js')} className={cn("px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-md transition-all border-b-2", activeCodeTab === 'js' ? "border-indigo-500 text-white bg-slate-800" : "border-transparent text-slate-500 hover:text-slate-300")}>JavaScript</button>
                <button onClick={() => setActiveCodeTab('python')} className={cn("px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-md transition-all border-b-2", activeCodeTab === 'python' ? "border-indigo-500 text-white bg-slate-800" : "border-transparent text-slate-500 hover:text-slate-300")}>Python</button>
              </div>
              <button onClick={() => handleCopy("code-sample-content", "code")} className="p-2 text-slate-400 hover:text-white transition-colors mr-2">
                {copiedKey === 'code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-5 overflow-x-auto text-xs font-mono leading-relaxed bg-slate-900 text-slate-300">
              {activeCodeTab === 'curl' && (
                <pre>
<span className="text-pink-400">curl</span> <span className="text-slate-400">-X</span> POST <span className="text-emerald-400">"https://api.beraucoal.co.id/v1/question-bank/generate"</span> \
  <span className="text-slate-400">-H</span> <span className="text-emerald-400">"Authorization: Bearer &lt;API_KEY&gt;"</span> \
  <span className="text-slate-400">-H</span> <span className="text-emerald-400">"Content-Type: application/json"</span> \
  <span className="text-slate-400">-d</span> <span className="text-emerald-400">'{'{'}</span>
    <span className="text-indigo-300">"lpi_id"</span>: <span className="text-emerald-400">"LPI-2026-09-012"</span>
  <span className="text-emerald-400">{'}'}'</span>
                </pre>
              )}
              {activeCodeTab === 'js' && (
                <pre>
<span className="text-pink-400">const</span> response = <span className="text-pink-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-emerald-400">'https://api.beraucoal.co.id/v1/question-bank/generate'</span>, {'{'}
  <span className="text-indigo-300">method</span>: <span className="text-emerald-400">'POST'</span>,
  <span className="text-indigo-300">headers</span>: {'{'}
    <span className="text-emerald-400">'Authorization'</span>: <span className="text-emerald-400">`Bearer ${'{'}API_KEY{'}'}`</span>,
    <span className="text-emerald-400">'Content-Type'</span>: <span className="text-emerald-400">'application/json'</span>
  {'}'},
  <span className="text-indigo-300">body</span>: <span className="text-blue-400">JSON</span>.<span className="text-blue-400">stringify</span>({'{'}
    <span className="text-indigo-300">lpi_id</span>: <span className="text-emerald-400">'LPI-2026-09-012'</span>
  {'}'})
{'}'});

<span className="text-pink-400">const</span> data = <span className="text-pink-400">await</span> response.<span className="text-blue-400">json</span>();
                </pre>
              )}
              {activeCodeTab === 'python' && (
                <pre>
<span className="text-pink-400">import</span> requests

url = <span className="text-emerald-400">"https://api.beraucoal.co.id/v1/question-bank/generate"</span>
headers = {'{'}
    <span className="text-emerald-400">"Authorization"</span>: <span className="text-emerald-400">f"Bearer {'{'}API_KEY{'}'}"</span>,
    <span className="text-emerald-400">"Content-Type"</span>: <span className="text-emerald-400">"application/json"</span>
{'}'}
data = {'{'}
    <span className="text-emerald-400">"lpi_id"</span>: <span className="text-emerald-400">"LPI-2026-09-012"</span>
{'}'}

response = requests.post(url, headers=headers, json=data)
result = response.json()
                </pre>
              )}
            </div>
          </div>

          {/* Governance Section */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">API Governance</h3>
            </div>
            <div className="flex flex-col">
              {/* Access Control */}
              <div className="border-b border-slate-100">
                <button onClick={() => setExpandedGov(expandedGov === 'access' ? null : 'access')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-3">
                     <Shield className="w-4 h-4 text-indigo-500" />
                     <span className="text-[13px] font-bold text-slate-800">Access Control & Environment</span>
                   </div>
                   {expandedGov === 'access' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedGov === 'access' && (
                  <div className="p-4 pt-0 text-[12px] text-slate-600 leading-relaxed bg-white">
                    <p className="mb-3">API Question Bank membedakan lingkungan Sandbox dan Production. Anda memerlukan API Key terpisah untuk masing-masing lingkungan.</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded">
                        <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">SANDBOX</div>
                        <p className="text-blue-800">Digunakan untuk testing. Menggunakan LPI tiruan atau data non-produksi. Aman untuk percobaan integrasi.</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded">
                        <div className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">PRODUCTION</div>
                        <p className="text-rose-800">Terkoneksi langsung dengan sistem utama. Harus melewati proses approval IT Governance untuk mendapatkan Production Key.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Handling */}
              <div className="border-b border-slate-100">
                <button onClick={() => setExpandedGov(expandedGov === 'data' ? null : 'data')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-3">
                     <FileText className="w-4 h-4 text-indigo-500" />
                     <span className="text-[13px] font-bold text-slate-800">Data Handling & Limits</span>
                   </div>
                   {expandedGov === 'data' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedGov === 'data' && (
                  <div className="p-4 pt-0 text-[12px] text-slate-600 leading-relaxed bg-white grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate Limit</span>
                      <span className="text-[13px] font-semibold text-slate-800">60 requests / minute</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Limit (PDF)</span>
                      <span className="text-[13px] font-semibold text-slate-800">Max 25 MB</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retention Policy</span>
                      <span className="text-[12px] text-slate-700">Dokumen sumber (.pdf) hanya diproses in-memory dan segera dihapus. Hasil pertanyaan disimpan 30 hari dalam cache API berdasarkan <span className="font-mono bg-slate-200 px-1 rounded">request_id</span>.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Access Management */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">API Access</h3>
              <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold">Buat API Key</Button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Environment</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Used</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {apiKeys.map(k => (
                    <tr key={k.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{k.name}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-100">{k.env}</span>
                      </td>
                      <td className="p-4 text-slate-500">{k.lastUsed}</td>
                      <td className="p-4">
                        {k.status === 'Active' ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Revoked
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {k.status === 'Active' && (
                          <div className="flex items-center justify-end gap-2 relative">
                            {showRevokeConfirm === k.id ? (
                              <div className="absolute right-0 bg-white border border-rose-200 shadow-lg p-2 rounded-lg flex items-center gap-2 z-10 w-[200px]">
                                <span className="text-[10px] font-bold text-rose-600 flex-1 text-left">Cabut akses API?</span>
                                <Button size="sm" variant="ghost" onClick={() => setShowRevokeConfirm(null)} className="h-6 px-2 text-[10px]">Batal</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRevoke(k.id)} className="h-6 px-2 text-[10px]">Cabut</Button>
                              </div>
                            ) : (
                              <>
                                <button className="text-slate-400 hover:text-slate-700 p-1" title="Regenerate Key">
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button onClick={() => setShowRevokeConfirm(k.id)} className="text-slate-400 hover:text-rose-600 p-1" title="Revoke Key">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: API Tester */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl sticky top-6">
            <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">Test API</h3>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Environment</label>
                  <select className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-3 py-2 outline-none focus:border-indigo-500">
                    <option>Sandbox</option>
                    <option disabled>Production (Requires Key)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Input Type</label>
                  <select 
                    value={inputMode}
                    onChange={(e) => setInputMode(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-3 py-2 outline-none focus:border-indigo-500"
                  >
                    <option value="LPI">LPI ID</option>
                    <option value="PDF">Upload PDF</option>
                  </select>
                </div>
              </div>

              {inputMode === 'LPI' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document ID</label>
                  <input 
                    type="text" 
                    value={testLpiId}
                    onChange={(e) => setTestLpiId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                    placeholder="LPI-XXXXX"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document File</label>
                  <div className="border-2 border-dashed border-slate-700 bg-slate-800/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
                    <span className="text-xs text-slate-400">Pilih file PDF...</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSendTest}
                disabled={testStatus === 'LOADING'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 shadow-lg shadow-indigo-900/20"
              >
                {testStatus === 'LOADING' ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Mengirim...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Request</span>
                )}
              </Button>

            </div>

            {/* Response Area */}
            <div className="border-t border-slate-800 bg-slate-950">
               <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800">
                 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Response</h4>
                 {testStatus === 'SUCCESS' && (
                   <div className="flex gap-3">
                     <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> 200 OK</span>
                     <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 2.4s</span>
                   </div>
                 )}
               </div>
               <div className="p-5 h-[300px] overflow-y-auto custom-scrollbar relative font-mono text-xs text-slate-300">
                  {testStatus === 'IDLE' && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                      <Zap className="w-8 h-8 mb-2" />
                      <p>Kirim request untuk melihat response API</p>
                    </div>
                  )}
                  {testStatus === 'LOADING' && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mb-3 text-indigo-500" />
                      <div className="space-y-2 w-3/4 max-w-[200px]">
                        <div className="h-2 bg-slate-800 rounded animate-pulse" />
                        <div className="h-2 bg-slate-800 rounded animate-pulse w-4/5" />
                      </div>
                    </div>
                  )}
                  {testStatus === 'SUCCESS' && (
                    <>
                      <button onClick={() => handleCopy(JSON.stringify(testResponse, null, 2), 'response')} className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
                        {copiedKey === 'response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="text-emerald-400">
                        {JSON.stringify(testResponse, null, 2).replace(/"(.*?)":/g, '<span class="text-indigo-300">"$1"</span>:')}
                      </pre>
                    </>
                  )}
               </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Bottom Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
         <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">API Activity</h3>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">10 Request Terakhir</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Request ID</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-mono">
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 font-sans">10:42 WIB</td>
                <td className="p-4 text-slate-800 font-semibold font-sans">Demo Sandbox</td>
                <td className="p-4 text-slate-600">req_92H8fK2</td>
                <td className="p-4 text-slate-600">POST /generate</td>
                <td className="p-4">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">200</span>
                </td>
                <td className="p-4 text-slate-500">2.4s</td>
              </tr>
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 font-sans">10:31 WIB</td>
                <td className="p-4 text-slate-800 font-semibold font-sans">Demo Sandbox</td>
                <td className="p-4 text-slate-600">req_82F1aX9</td>
                <td className="p-4 text-slate-600">POST /generate</td>
                <td className="p-4">
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-bold">422</span>
                </td>
                <td className="p-4 text-slate-500">0.3s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
