const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

const replacementStr = `function AnalysisTab() {
  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [execMode, setExecMode] = useState<"idle" | "full" | "manual">("idle");
  const [globalStatus, setGlobalStatus] = useState<"idle" | "running" | "blocked" | "completed" | "stopped" | "failed">("idle");
  
  const [chainQueue, setChainQueue] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [history, setHistory] = useState([
    { runId: "RUN-046", agent: "PEEPO Reasoning", triggeredBy: "Sarah Chen", mode: "Manual", inputSource: "Evidence Batch B1", deps: "None", status: "completed", started: "10:12:00", finished: "10:12:45", duration: "45s" }
  ]);

  useEffect(() => {
    if (globalStatus === 'running' && !activeTask && chainQueue.length > 0) {
      const nextId = chainQueue[0];
      const agent = agents.find(a => a.id === nextId)!;
      
      const depsFailedOrBlocked = agent.dependencies.some(dId => {
        const d = agents.find(x => x.id === dId)!;
        return d.status === 'failed' || d.status === 'blocked';
      });

      if (depsFailedOrBlocked && execMode === "full") {
        setGlobalStatus('blocked');
        setAgents(prev => prev.map(a => a.id === nextId ? { ...a, status: 'blocked', dependencyState: 'Blocked' } : a));
        return;
      }

      setActiveTask(nextId);
      setAgents(prev => prev.map(a => a.id === nextId ? { ...a, status: 'running', triggeredBy: execMode === 'full' ? 'System' : 'Current User' } : a));

      setTimeout(() => {
        const d = new Date();
        setAgents(prev => {
          const a = prev.find(x => x.id === nextId);
          if (a?.status === 'running') {
            return prev.map(x => x.id === nextId ? { 
              ...x, 
              status: 'completed', 
              lastRunTimestamp: d.toLocaleTimeString(),
              lastUpdatedTimestamp: d.toLocaleTimeString(),
              confidence: (85 + Math.floor(Math.random() * 10)) + "%",
              dependencyState: 'Resolved'
            } : x);
          }
          return prev;
        });

        setAgents(currentAgents => {
           const finalA = currentAgents.find(x => x.id === nextId);
           if (finalA?.status === 'completed' || finalA?.status === 'warning') {
              setHistory(h => [{
                 runId: \`RUN-\${Math.floor(Math.random()*1000).toString().padStart(3,'0')}\`,
                 agent: finalA.name,
                 triggeredBy: finalA.triggeredBy || "System",
                 mode: execMode === "full" ? "Auto" : "Manual",
                 inputSource: "Context",
                 deps: finalA.dependencies.length > 0 ? "Resolved" : "None",
                 status: finalA.status,
                 started: d.toLocaleTimeString(),
                 finished: new Date(d.getTime() + 3000).toLocaleTimeString(),
                 duration: "3s"
              }, ...h]);
           }
           
           if (execMode === 'full') {
               return currentAgents.map(a => {
                   if (a.status === 'idle' && a.dependencies.every(dId => currentAgents.find(x => x.id === dId)?.status === 'completed')) {
                       return { ...a, dependencyState: 'Ready' };
                   }
                   return a;
               })
           }
           return currentAgents;
        });

        setChainQueue(q => q.slice(1));
        setActiveTask(null);
      }, 4000);
    } else if (globalStatus === 'running' && !activeTask && chainQueue.length === 0) {
      setGlobalStatus('completed');
    }
  }, [chainQueue, activeTask, globalStatus, agents, execMode]);

  const startFullChain = () => {
    setExecMode("full");
    setGlobalStatus("running");
    setAgents(prev => prev.map(a => ({ 
        ...a, 
        status: 'queued', 
        dependencyState: a.dependencies.length === 0 ? 'Ready' : \`Wait: \${a.dependencies[0]}\`
    })));
    setChainQueue(["fact", "actor", "peepo", "ipls", "prev"]);
  };

  const stopChain = () => {
    setGlobalStatus("stopped");
    setAgents(prev => prev.map(a => a.status === 'queued' || a.status === 'running' ? { ...a, status: 'cancelled' } : a));
    setChainQueue([]);
    setActiveTask(null);
  };

  const continueChain = () => {
     setGlobalStatus("running");
     const eligible = agents.filter(a => a.status === 'blocked').map(a => a.id);
     if (eligible.length > 0) {
         setChainQueue(eligible);
         setAgents(prev => prev.map(a => eligible.includes(a.id) ? { ...a, status: 'queued' } : a));
     } else {
         setGlobalStatus('completed');
     }
  }

  const runSingle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setExecMode("manual");
    setGlobalStatus("running");
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'queued', lastRunTimestamp: undefined, dependencyState: 'Checking...' } : a));
    setChainQueue([id]);
  };

  const simulateFailure = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'failed', dependencyState: 'Failed' } : a));
      setActiveTask(null);
      setChainQueue(q => q.slice(1));
      
      const hasDeps = agents.some(a => a.dependencies.includes(id) && (a.status === 'queued' || execMode === 'full'));
      if (execMode === 'full' && hasDeps) {
          setGlobalStatus('blocked');
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'completed': return 'border-emerald-200/60 bg-emerald-50 text-emerald-700';
          case 'running': return 'border-blue-200/60 bg-blue-50 text-blue-700';
          case 'queued': return 'border-slate-200/60 bg-slate-50 text-slate-600';
          case 'failed': return 'border-rose-200/60 bg-rose-50 text-rose-700';
          case 'blocked': return 'border-amber-200/60 bg-amber-50 text-amber-700';
          case 'skipped': return 'border-slate-200/60 bg-slate-50 text-slate-500';
          default: return 'border-slate-200 bg-white text-slate-400';
      }
  };

  const stats = {
      total: agents.length,
      completed: agents.filter(a => a.status === 'completed').length,
      running: agents.filter(a => a.status === 'running').length,
      failed: agents.filter(a => a.status === 'failed').length,
      blocked: agents.filter(a => a.status === 'blocked').length,
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7]">
      
      {/* Top Banner Control */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-20 shrink-0 px-8 py-5 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div>
               <h2 className="text-[17px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  Intelligence Execution Chain
                  {globalStatus === 'running' && <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse ml-1" />}
               </h2>
               <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Orchestrated Investigation Pipeline</p>
            </div>
            {execMode === 'full' && globalStatus === 'running' ? (
               <Button onClick={stopChain} variant="destructive" className="h-8 text-[10px] font-semibold gap-1.5 px-4 shadow-sm ml-4 bg-rose-600 hover:bg-rose-700"><StopCircle className="h-3.5 w-3.5" /> Terminate Pipeline</Button>
            ) : (
               <Button onClick={startFullChain} className="h-8 text-[10px] font-semibold gap-1.5 px-4 bg-slate-800 hover:bg-slate-900 shadow-sm transition-all text-white ml-4">
                  <Play className="h-3 w-3" fill="currentColor" /> Initialize Pipeline
               </Button>
            )}
         </div>
         
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 tabular-nums">
               <div className="text-center"><span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total</span><span className="text-[13px] font-bold text-slate-700">{stats.total}</span></div>
               <div className="text-center"><span className="block text-[8px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Resolved</span><span className="text-[13px] font-bold text-emerald-700">{stats.completed}</span></div>
               <div className="text-center"><span className="block text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-1">Failed</span><span className="text-[13px] font-bold text-rose-600">{stats.failed}</span></div>
               <div className="text-center"><span className="block text-[8px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-1">Blocked</span><span className="text-[13px] font-bold text-amber-600">{stats.blocked}</span></div>
            </div>
         </div>
      </div>

      {globalStatus === 'blocked' && (
         <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-2.5">
               <AlertTriangle className="h-4 w-4 text-amber-600" />
               <div>
                  <span className="text-[13px] font-bold text-amber-900 block">Orchestration Halted</span>
                  <span className="text-[10px] text-amber-700">Downstream modules restricted. Please intervene or override dependencies.</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={continueChain} variant="outline" className="h-7 text-[10px] font-semibold border-amber-300 text-amber-900 bg-amber-100 hover:bg-amber-200 gap-1.5 shadow-sm"><FastForward className="h-3 w-3" /> Continue Eligible Nodes</Button>
            </div>
         </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar pt-10 pb-12 px-8 flex flex-col">
         <div className="w-full max-w-[1500px] mx-auto space-y-8 flex-1 flex flex-col">
            
            {/* Visual Node Strip Mapping */}
            <div className="flex items-center justify-between w-full relative px-[10%]">
               <div className="absolute top-1/2 left-[12%] right-[12%] h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
               {agents.map((a, i) => (
                  <div key={\`track-\${a.id}\`} className={\`relative z-10 flex flex-col items-center gap-2 bg-transparent transition-all \${a.status === 'running' ? 'scale-110' : ''}\`}>
                     <div className={\`h-8 w-8 rounded-full border-[1.5px] flex items-center justify-center bg-white shadow-sm transition-colors \${
                        a.status === 'completed' ? 'border-emerald-500 text-emerald-600' :
                        a.status === 'failed' ? 'border-rose-500 text-rose-600' :
                        a.status === 'running' ? 'border-blue-500 text-blue-600 ring-2 ring-blue-500/20' :
                        a.status === 'blocked' ? 'border-amber-500 text-amber-600' :
                        'border-slate-300 text-slate-300'
                     }\`}>
                        {a.status === 'completed' ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> :
                         a.status === 'failed' ? <X className="h-3 w-3" strokeWidth={2.5} /> :
                         a.status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> :
                         <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />}
                     </div>
                  </div>
               ))}
            </div>

            {/* Industrial Grid Cards */}
            <div className="grid grid-cols-5 gap-4 w-full">
               {agents.map((agent) => (
                  <div key={agent.id} className={\`flex flex-col bg-white border rounded-lg overflow-hidden transition-all \${
                     agent.status === 'running' ? 'border-blue-300 ring-1 ring-blue-300 shadow-[0_4px_12px_rgba(59,130,246,0.1)] z-10' : 
                     'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                  }\`}>
                     {agent.status === 'running' && (
                        <div className="h-0.5 w-full bg-blue-100 overflow-hidden">
                           <div className="h-full w-full bg-blue-500" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                        </div>
                     )}

                     {/* Structural Header */}
                     <div className="border-b border-slate-100 px-3.5 py-3 flex items-start justify-between bg-[#FCFCFD]">
                        <div className="flex items-center gap-2">
                           <agent.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                           <h3 className="text-[11px] font-bold text-slate-800 leading-tight">{agent.name}</h3>
                        </div>
                        <span className={\`border px-1.5 py-[1px] rounded-[3px] text-[8px] font-bold uppercase tracking-widest leading-none \${getStatusColor(agent.status)}\`}>
                           {agent.status}
                        </span>
                     </div>

                     <div className="p-3.5 flex flex-col flex-1">
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-2 h-[30px]">
                           {agent.purpose}
                        </p>

                        <div className="bg-slate-50/60 border border-slate-100/80 rounded-md flex flex-col p-2.5 space-y-1.5 mb-4 mt-auto">
                           <div className="flex justify-between items-center text-[9px]">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider">Confidence</span>
                              <span className="text-slate-800 font-bold">{agent.confidence || "—"}</span>
                           </div>
                           <div className="flex justify-between items-center text-[9px]">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider">Last Run</span>
                              <span className="text-slate-700 truncate max-w-[80px]">{agent.lastRunTimestamp || "Never"}</span>
                           </div>
                           <div className="flex justify-between items-center text-[9px]">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider">Dependency</span>
                              <span className="text-slate-500 truncate max-w-[80px] text-right" title={agent.dependencyState}>{agent.dependencyState || "Ready"}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                           <Button 
                              onClick={(e) => runSingle(agent.id, e)} 
                              variant="outline"
                              className={\`flex-1 h-7 text-[9px] font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm \${agent.status === 'running' ? 'opacity-50 pointer-events-none' : ''}\`}
                           >
                              {agent.status === 'failed' || agent.status === 'completed' ? <RefreshCcw className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" fill="currentColor" />} {agent.status === 'completed' ? 'Re-run' : 'Execute'} 
                           </Button>
                           <Button 
                              variant="secondary"
                              onClick={() => setSelectedAgentId(agent.id)} 
                              className="flex-1 h-7 text-[9px] font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-sm shadow-sm"
                           >
                              Inspect Node
                           </Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Subdued / Enterprise Table Log */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 mt-6 w-full">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">Execution Log Trace</h3>
                  <Button variant="ghost" size="sm" className="h-6 text-[9px] font-semibold text-slate-500 hover:text-slate-800">Export CSV</Button>
               </div>
               <div className="overflow-hidden border border-slate-100 rounded-md">
                  <table className="w-full text-left bg-white">
                     <thead>
                       <tr className="bg-[#f8f9fa] border-b border-slate-200">
                         <th className="py-2 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trace ID</th>
                         <th className="py-2 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Module Node</th>
                         <th className="py-2 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trigger Source</th>
                         <th className="py-2 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Exe Mode</th>
                         <th className="py-2 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status Code</th>
                         <th className="py-2 px-3 text-right text-[9px] font-bold text-slate-500 uppercase tracking-widest">Audit</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {history.map((run, i) => (
                         <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="py-2.5 px-3 font-mono text-[9px] text-blue-600 font-medium">{run.runId}</td>
                           <td className="py-2.5 px-3 text-[10px] font-bold text-slate-800">{run.agent}</td>
                           <td className="py-2.5 px-3 text-[9px] text-slate-500">{run.triggeredBy}</td>
                           <td className="py-2.5 px-3 text-[9px] text-slate-500">{run.mode}</td>
                           <td className="py-2.5 px-3">
                             <span className={\`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border \${getStatusColor(run.status)}\`}>
                               {run.status}
                             </span>
                           </td>
                           <td className="py-2.5 px-3 text-right">
                             <Button variant="ghost" size="sm" className="h-5 text-[9px] font-medium text-slate-400 group-hover:text-slate-700 tracking-wide rounded-sm">View Payload</Button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>
      </div>

      {/* FLOATING DETAIL PANEL (Preserved & Styled Enterprise) */}
      {selectedAgent && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 text-left rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               
               {/* Panel Header */}
               <div className="px-6 py-4 border-b border-slate-100 bg-[#FCFCFD] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3.5">
                     <div className="h-8 w-8 rounded flex items-center justify-center border shadow-sm bg-white text-slate-500 border-slate-200">
                        <selectedAgent.icon className="h-4 w-4" />
                     </div>
                     <div>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block leading-none mb-1">Intelligence Diagnostics</span>
                        <h3 className="text-base font-bold text-slate-900 leading-none">{selectedAgent.name}</h3>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-7 px-3 text-[9px] font-medium border-slate-200 text-slate-600 rounded-sm"><FileJson className="h-3 w-3 mr-1.5" /> Raw Trace</Button>
                     <Button variant="ghost" size="sm" onClick={() => setSelectedAgentId(null)} className="h-7 w-7 p-0 rounded hover:bg-slate-100 text-slate-500">
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
               </div>

               {/* Operational Metadata Ribbon */}
               <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex flex-wrap items-center gap-5 shrink-0">
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">State</span>
                     <span className={\`border px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest \${getStatusColor(selectedAgent.status)}\`}>
                        {selectedAgent.status}
                     </span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Confidence</span>
                     <span className="text-[11px] font-bold text-slate-800">{selectedAgent.confidence || "—"}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Last Run</span>
                     <span className="text-[10px] font-bold text-slate-600">{selectedAgent.lastRunTimestamp || "Never"}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Trigger Source</span>
                     <span className="text-[10px] font-bold text-slate-600">{selectedAgent.triggeredBy || "—"}</span>
                  </div>
               </div>

               {/* Panel Body */}
               <div className="flex-1 overflow-auto custom-scrollbar bg-[#f4f5f7]/30 p-6">
                  {selectedAgent.status === 'running' ? (
                     <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-16">
                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                        <div>
                           <span className="text-[11px] font-bold text-slate-800 uppercase tracking-widest block mb-1">Inferencing Data Array</span>
                           <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Evaluating temporal markers against logic bounds...</p>
                        </div>
                     </div>
                  ) : selectedAgent.status === 'failed' ? (
                     <div className="p-5 bg-rose-50 rounded-lg border border-rose-100 max-w-2xl mx-auto my-8">
                        <div className="flex items-start gap-4">
                           <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                           <div>
                              <span className="text-[12px] font-bold text-rose-900 block mb-1.5">Module Compute Failed</span>
                              <p className="text-[11px] text-rose-700 mb-3 leading-relaxed">Timeout detected on inference payload. Resolve dependencies to retry.</p>
                              <Button size="sm" onClick={() => runSingle(selectedAgent.id)} className="h-7 text-[10px] font-semibold bg-rose-700 hover:bg-rose-800 text-white rounded-sm"><RefreshCcw className="h-3 w-3 mr-1.5" /> Initialize Retry</Button>
                           </div>
                        </div>
                     </div>
                  ) : (selectedAgent.status === 'completed' && selectedAgent.results) ? (
                     <div className="max-w-3xl mx-auto space-y-5">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 flex-1">Structured Extraction Result</h4>
                           <Button variant="ghost" size="sm" onClick={() => runSingle(selectedAgent.id)} className="h-6 text-[9px] font-semibold text-slate-600 hover:text-slate-900 ml-3 rounded-sm"><RefreshCcw className="h-2.5 w-2.5 mr-1" /> Re-trigger</Button>
                        </div>
                        
                        {selectedAgent.id === 'fact' ? (
                           <div className="space-y-6">
                              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                                 <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Event Synopsis</h5>
                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-[11px] text-slate-700">
                                    <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Date Logged</span>{selectedAgent.results.ringkasan.tanggal}</div>
                                    <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Time Trace</span>{selectedAgent.results.ringkasan.jam}</div>
                                    <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Sector Zone</span>{selectedAgent.results.ringkasan.lokasi}</div>
                                    <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Class Type</span>{selectedAgent.results.ringkasan.jenis}</div>
                                 </div>
                                 <p className="text-[11px] leading-relaxed text-slate-700 font-medium bg-slate-50 p-3 rounded border border-slate-100">{selectedAgent.results.ringkasan.deskripsi}</p>
                              </div>

                              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                                 <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-5">Chain of Custody Timeline</h5>
                                 <div className="space-y-6">
                                    {/* Pra Kontak */}
                                    <div>
                                       <div className="flex items-center gap-2 mb-3">
                                          <div className="h-5 rounded border bg-emerald-50 border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-widest px-2.5 flex items-center">Pre-Contact</div>
                                          <div className="h-px bg-slate-100 flex-1"/>
                                       </div>
                                       <div className="pl-2 space-y-4 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                          {selectedAgent.results.timeline.praKontak.map((item: any, idx: number) => (
                                             <div key={idx} className="relative pl-6">
                                                <div className="absolute left-[3px] top-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-500"/>
                                                <span className="block text-[10px] font-bold text-slate-800 mb-0.5">{item.waktu} &mdash; <span className="font-semibold text-slate-600">{item.kejadian}</span></span>
                                                <div className="flex gap-3 text-[9px]">
                                                   <span className="text-slate-400">Evid Hash: <span className="font-medium text-slate-600">{item.evidence}</span></span>
                                                   <span className="text-slate-400">Conf Index: <span className="font-medium text-emerald-600">{item.confidence}</span></span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Kontak */}
                                    <div>
                                       <div className="flex items-center gap-2 mb-3">
                                          <div className="h-5 rounded border bg-rose-50 border-rose-200 text-rose-700 text-[9px] font-bold uppercase tracking-widest px-2.5 flex items-center">Contact Phase</div>
                                          <div className="h-px bg-slate-100 flex-1"/>
                                       </div>
                                       <div className="pl-2 space-y-4 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                          {selectedAgent.results.timeline.kontak.map((item: any, idx: number) => (
                                             <div key={idx} className="relative pl-6">
                                                <div className="absolute left-[3px] top-1.5 h-3 w-3 rounded-full bg-white border-2 border-rose-600"/>
                                                <span className="block text-[10px] font-bold text-slate-900 mb-0.5">{item.waktu} &mdash; <span className="font-medium text-slate-700">{item.kejadian}</span></span>
                                                <div className="flex gap-3 text-[9px]">
                                                   <span className="text-slate-400">Evid Hash: <span className="font-medium text-slate-600">{item.evidence}</span></span>
                                                   <span className="text-slate-400">Conf Index: <span className="font-medium text-rose-600">{item.confidence}</span></span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Pasca Kontak */}
                                    <div>
                                       <div className="flex items-center gap-2 mb-3">
                                          <div className="h-5 rounded border bg-amber-50 border-amber-200 text-amber-700 text-[9px] font-bold uppercase tracking-widest px-2.5 flex items-center">Post-Contact</div>
                                          <div className="h-px bg-slate-100 flex-1"/>
                                       </div>
                                       <div className="pl-2 space-y-4 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                          {selectedAgent.results.timeline.pascaKontak.map((item: any, idx: number) => (
                                             <div key={idx} className="relative pl-6">
                                                <div className="absolute left-[3px] top-1.5 h-3 w-3 rounded-full bg-white border-2 border-amber-500"/>
                                                <span className="block text-[10px] font-bold text-slate-800 mb-0.5">{item.waktu} &mdash; <span className="font-semibold text-slate-600">{item.kejadian}</span></span>
                                                <div className="flex gap-3 text-[9px]">
                                                   <span className="text-slate-400">Evid Hash: <span className="font-medium text-slate-600">{item.evidence}</span></span>
                                                   <span className="text-slate-400">Conf Index: <span className="font-medium text-slate-600">{item.confidence}</span></span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Confirmed Indicators</h5>
                                    <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-medium text-slate-700">
                                       {selectedAgent.results.faktaTerkonfirmasi.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                    </ul>
                                 </div>
                                 <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Logically Inferred Sequence</h5>
                                    <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-medium text-slate-700">
                                       {selectedAgent.results.inferensi.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                    </ul>
                                 </div>
                                 <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Missing Evidence / Gaps</h5>
                                    <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-medium text-slate-700 hover:text-rose-600 transition-colors">
                                       {selectedAgent.results.gap.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                    </ul>
                                 </div>
                                 <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Correlated Vectors (4P)</h5>
                                    <div className="space-y-1.5 text-[10px] font-medium text-slate-700">
                                       {Object.entries(selectedAgent.results.referensi).map(([k, v]) => (
                                          <div key={k} className="flex"><span className="font-bold text-slate-400 w-16 shrink-0 uppercase tracking-wider text-[8px] mt-0.5">{k}</span> <span>{v as string}</span></div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 gap-3">
                              {Object.entries(selectedAgent.results).map(([key, value]) => (
                                 <div key={key} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{key}</span>
                                    <div className="text-[11px] font-medium text-slate-700 leading-relaxed">
                                       {Array.isArray(value) ? (
                                          <ul className="list-disc pl-4 space-y-1">
                                             {(value as string[]).map(v => <li key={v}>{v}</li>)}
                                          </ul>
                                       ) : (
                                          <p>{value as string}</p>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-16">
                        <DocIcon className="h-8 w-8 text-slate-400 mb-3" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Extraction</span>
                        <p className="text-[9px] text-slate-400 mt-1">Execute the processing node to synthesize structured variables.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}`;

try {
  let newText = text.slice(0, text.indexOf('function AnalysisTab(')) + replacementStr + text.slice(text.indexOf('function ReportsTab('));
  fs.writeFileSync(CACHE_FILE, newText);
  console.log("Successfully replaced AnalysisTab contents.");
} catch (e) {
  console.error("Failed string replacement.", e);
}
