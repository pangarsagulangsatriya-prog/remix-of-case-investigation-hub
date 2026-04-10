const fs = require('fs');
const content = `type AgentStatus = 'idle' | 'queued' | 'running' | 'completed' | 'warning' | 'failed' | 'blocked' | 'skipped' | 'cancelled';

interface AgentState {
  id: string;
  name: string;
  icon: any;
  purpose: string;
  status: AgentStatus;
  confidence?: string;
  lastRunTimestamp?: string;
  lastUpdatedTimestamp?: string;
  triggeredBy?: string;
  dependencyState?: string;
  dependencies: string[];
  results?: any;
}

const initialAgentsState: AgentState[] = [
  {
    id: "fact", name: "Fact & Chronology", icon: Clock, purpose: "Build a verified timeline from available evidence fragments.", status: 'idle', dependencies: [], dependencyState: 'Ready',
    results: {
      "Timeline Summary": "Vibration noticed first, supervisor informed, failure escalated afterward",
      "Confirmed Events": ["Operator noticed abnormal vibration", "Supervisor was notified before failure", "Warning system was reportedly functioning"],
      "Inferred Sequence": "Mechanical condition likely worsened before full failure",
      "Evidence References": "audio statement, CCTV footage, inspection document"
    }
  },
  {
    id: "actor", name: "Actor Intelligence", icon: Users, purpose: "Analyze worker profiles, training history, and behavioral signals.", status: 'idle', dependencies: ["fact"], dependencyState: 'Waiting for Fact',
    results: {
      "Detected Actors / Roles": "Operator, Supervisor",
      "Operational Role Note": "Operator detected anomaly, supervisor became escalation point",
      "Behavior Signal": "Response appears reactive, not preemptive",
      "Capability / Readiness Note": "communication chain exists but may be too dependent on manual reporting"
    }
  },
  {
    id: "peepo", name: "PEEPO Reasoning", icon: Brain, purpose: "Analyze high-level safety culture and human factors.", status: 'idle', dependencies: ["fact", "actor"], dependencyState: 'Waiting for upstream',
    results: {
      "Human Factor Signals": "Operator reacted after noticing unusual vibration",
      "Task / Process Pressure": "Escalation happened after operational anomaly was already noticeable",
      "Environmental Context": "Conveyor zone appears active and high-risk",
      "Organizational Signal": "Early response depended on verbal relay"
    }
  },
  {
    id: "ipls", name: "IPLS Classification", icon: FileSearch, purpose: "Classify incident according to enterprise safety standards.", status: 'idle', dependencies: ["peepo"], dependencyState: 'Waiting for PEEPO',
    results: {
      "Primary Classification": "Mechanical Failure",
      "Subclassification": "Conveyor Belt / Roller Degradation",
      "Severity Level": "High",
      "Supporting Indicators": "Belt deflection, friction anomaly, delayed response mention"
    }
  },
  {
    id: "prev", name: "Prevention Engine", icon: CheckCircle2, purpose: "Generate preventive actions and control recommendations.", status: 'idle', dependencies: ["ipls"], dependencyState: 'Waiting for IPLS',
    results: {
      "Immediate Actions": "isolate conveyor section, verify roller condition, inspect barrier control",
      "Preventive Controls": "strengthen anomaly reporting trigger and pre-failure inspection checkpoints",
      "Control Hierarchy": "engineering control first, admin control second",
      "Priority Level": "High"
    }
  }
];

function AnalysisTab() {
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

  const skipAgent = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'skipped', dependencyState: 'Skipped' } : a));
      if (activeTask === id) {
          setActiveTask(null);
          setChainQueue(q => q.slice(1));
      } else {
          setChainQueue(q => q.filter(x => x !== id));
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
          case 'running': return 'text-primary bg-primary/10 border-primary/20';
          case 'queued': return 'text-slate-600 bg-slate-100 border-slate-200';
          case 'failed': return 'text-rose-700 bg-rose-50 border-rose-200';
          case 'blocked': return 'text-amber-700 bg-amber-50 border-amber-200';
          case 'skipped': return 'text-slate-500 bg-slate-50 border-slate-200';
          case 'warning': return 'text-orange-700 bg-orange-50 border-orange-200';
          case 'cancelled': return 'text-slate-400 bg-slate-50 border-slate-200';
          default: return 'text-slate-400 bg-white border-slate-200';
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
    <div className="flex flex-col h-full overflow-hidden bg-[#fafafa]">
      
      {/* Top Banner Control */}
      <div className="bg-white border-b shadow-sm relative z-20 shrink-0 px-8 py-5 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div>
               <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  Intelligence Execution Chain
                  {globalStatus === 'running' && <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />}
               </h2>
               <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Orchestrated Investigation Pipeline</p>
            </div>
            {execMode === 'full' && globalStatus === 'running' ? (
               <Button onClick={stopChain} variant="destructive" className="h-9 text-[11px] font-bold gap-2 px-5 shadow-sm ml-4"><StopCircle className="h-3.5 w-3.5" /> Stop Chain</Button>
            ) : (
               <Button onClick={startFullChain} className="h-9 text-[11px] font-medium gap-2 px-5 bg-slate-900 hover:bg-slate-800 shadow-sm transition-all text-white ml-4">
                  <Play className="h-3 w-3" fill="currentColor" /> Run Full Intelligence Chain
               </Button>
            )}
         </div>
         
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 tabular-nums">
               <div className="text-center"><span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total</span><span className="text-sm font-black text-slate-800">{stats.total}</span></div>
               <div className="text-center"><span className="block text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1">Done</span><span className="text-sm font-black text-emerald-600">{stats.completed}</span></div>
               <div className="text-center"><span className="block text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-1">Failed</span><span className="text-sm font-black text-rose-600">{stats.failed}</span></div>
               <div className="text-center"><span className="block text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-1">Blocked</span><span className="text-sm font-black text-amber-600">{stats.blocked}</span></div>
            </div>
         </div>
      </div>

      {globalStatus === 'blocked' && (
         <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center justify-between shrink-0 shadow-sm animate-in fade-in slide-in-from-top-2 z-10 relative">
            <div className="flex items-center gap-3">
               <AlertTriangle className="h-5 w-5 text-amber-600" />
               <div>
                  <span className="text-sm font-bold text-amber-900 block">Execution Chain Blocked</span>
                  <span className="text-[11px] font-medium text-amber-700">Downstream modules restricted. Please intervene or override dependencies.</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={continueChain} variant="outline" className="h-8 text-[11px] font-medium border-amber-300 text-amber-900 bg-amber-400 hover:bg-amber-500 hover:border-amber-400 gap-1.5 shadow-sm"><FastForward className="h-3 w-3" /> Continue Eligible Agents</Button>
            </div>
         </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar pt-8 pb-12 px-8 flex flex-col">
         <div className="w-full max-w-[1500px] mx-auto space-y-8 flex-1 flex flex-col">
            
            {/* Visual Node Strip Mapping */}
            <div className="flex items-center justify-between w-full relative px-10">
               <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
               {agents.map((a, i) => (
                  <div key={\`track-\${a.id}\`} className={\`relative z-10 flex flex-col items-center gap-2 bg-transparent transition-all \${a.status === 'running' ? 'scale-110' : ''}\`}>
                     <div className={\`h-10 w-10 md:h-12 md:w-12 rounded-full border-4 flex items-center justify-center bg-white shadow-sm transition-colors \${
                        a.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                        a.status === 'failed' ? 'border-rose-500 text-rose-500' :
                        a.status === 'running' ? 'border-primary text-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]' :
                        a.status === 'blocked' ? 'border-amber-500 text-amber-500' :
                        'border-slate-200 text-slate-300'
                     }\`}>
                        {a.status === 'completed' ? <Check className="h-5 w-5" strokeWidth={3} /> :
                         a.status === 'failed' ? <X className="h-5 w-5" strokeWidth={3} /> :
                         a.status === 'running' ? <Loader2 className="h-5 w-5 animate-spin" /> :
                         <a.icon className="h-4 w-4 opacity-50" />}
                     </div>
                  </div>
               ))}
            </div>

            {/* Horizontal Grid (Fits perfectly, no slider) */}
            <div className="grid grid-cols-5 gap-4 w-full">
               {agents.map((agent) => (
                  <div key={agent.id} className={\`flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all group \${
                     agent.status === 'running' ? 'border-primary ring-1 ring-primary shadow-md scale-[1.02] z-10' : 
                     agent.status === 'failed' ? 'border-rose-200 shadow-sm' :
                     agent.status === 'completed' ? 'border-emerald-100 shadow-sm' :
                     'hover:border-slate-300'
                  }\`}>
                     {!agent.status.includes('running') && <div className={\`h-1 w-full \${agent.status === 'completed' ? 'bg-emerald-400' : agent.status === 'failed' ? 'bg-rose-400' : 'bg-slate-100'}\`} />}
                     
                     <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-3">
                           <div className={\`h-8 w-8 shrink-0 rounded-md flex items-center justify-center transition-colors \${
                              agent.status === 'running' ? 'bg-primary text-white shadow-inner' : 
                              'bg-slate-50 text-slate-500'
                           }\`}>
                              {agent.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <agent.icon className="h-4 w-4" />}
                           </div>
                           <span className={\`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest \${getStatusColor(agent.status)}\`}>
                              {agent.status}
                           </span>
                        </div>

                        <h3 className="text-[13px] font-bold text-slate-900 tracking-tight leading-tight mb-1">{agent.name}</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-2 min-h-[30px]">
                           {agent.purpose}
                        </p>

                        <div className="space-y-1.5 mt-auto border-t border-slate-50 pt-3 mb-4">
                           <div className="flex items-center justify-between text-[9px] font-medium">
                              <span className="text-slate-400 uppercase tracking-wider">Confidence</span>
                              <span className="text-slate-700">{agent.confidence || "—"}</span>
                           </div>
                           <div className="flex items-center justify-between text-[9px] font-medium">
                              <span className="text-slate-400 uppercase tracking-wider">Last Run</span>
                              <span className="text-slate-700 truncate max-w-[70px]">{agent.lastRunTimestamp || "Never"}</span>
                           </div>
                           <div className="flex items-center justify-between text-[9px] font-medium">
                              <span className="text-slate-400 uppercase tracking-wider">State</span>
                              <span className="text-slate-500 truncate max-w-[70px] text-right" title={agent.dependencyState}>{agent.dependencyState || "Ready"}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-auto pt-1">
                           <Button 
                              onClick={(e) => runSingle(agent.id, e)} 
                              variant="outline"
                              className={\`flex-1 h-7 text-[9px] font-semibold gap-1 border-slate-200 text-slate-700 hover:bg-slate-50 \${agent.status === 'running' ? 'opacity-50 pointer-events-none' : ''}\`}
                           >
                              {agent.status === 'failed' || agent.status === 'completed' ? <RefreshCcw className="h-3 w-3" /> : <Play className="h-3 w-3" fill="currentColor" />} {agent.status === 'completed' ? 'Re-run' : 'Run'} 
                           </Button>
                           <Button 
                              variant="secondary"
                              onClick={() => setSelectedAgentId(agent.id)} 
                              className="flex-1 h-7 text-[9px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                           >
                              Inspect
                           </Button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Execution History Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mt-8 w-full">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">Execution Log</h3>
                  <Button variant="ghost" size="sm" className="h-6 text-[9px] font-medium text-primary">View All</Button>
               </div>
               <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="w-full text-left bg-white">
                     <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                         <th className="py-2.5 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Run ID</th>
                         <th className="py-2.5 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Module</th>
                         <th className="py-2.5 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trigger</th>
                         <th className="py-2.5 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mode</th>
                         <th className="py-2.5 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                         <th className="py-2.5 px-3 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {history.map((run, i) => (
                         <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                           <td className="py-2 px-3 font-mono text-[9px] text-slate-500">{run.runId}</td>
                           <td className="py-2 px-3 text-[10px] font-semibold text-slate-700">{run.agent}</td>
                           <td className="py-2 px-3 text-[9px] text-slate-500">{run.triggeredBy}</td>
                           <td className="py-2 px-3 text-[9px] text-slate-500">{run.mode}</td>
                           <td className="py-2 px-3">
                             <span className={\`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider \${getStatusColor(run.status)}\`}>
                               {run.status}
                             </span>
                           </td>
                           <td className="py-2 px-3 text-right">
                             <Button variant="ghost" size="sm" className="h-5 text-[8px] font-medium text-slate-500 hover:text-slate-700 uppercase tracking-wide">Logs</Button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>
      </div>

      {/* FLOATING DETAIL PANEL */}
      {selectedAgent && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 text-left rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               
               {/* Panel Header */}
               <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                     <div className={\`h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm \${
                        selectedAgent.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        selectedAgent.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        selectedAgent.status === 'running' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                     }\`}>
                        <selectedAgent.icon className="h-4 w-4" />
                     </div>
                     <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">Module Inspector</span>
                        <h3 className="text-base font-bold text-slate-900 leading-none">{selectedAgent.name}</h3>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-7 px-3 text-[9px] font-medium border-slate-200 text-slate-600"><FileJson className="h-3 w-3 mr-1.5" /> Payload</Button>
                     <Button variant="ghost" size="sm" onClick={() => setSelectedAgentId(null)} className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 text-slate-500">
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
               </div>

               {/* Operational Metadata Ribbon */}
               <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-5 shrink-0">
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">State</span>
                     <span className={\`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest \${getStatusColor(selectedAgent.status)}\`}>
                        {selectedAgent.status}
                     </span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Confidence</span>
                     <span className="text-[11px] font-semibold text-slate-700">{selectedAgent.confidence || "—"}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Last Run</span>
                     <span className="text-[10px] font-medium text-slate-600">{selectedAgent.lastRunTimestamp || "Never"}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Triggered By</span>
                     <span className="text-[10px] font-medium text-slate-600">{selectedAgent.triggeredBy || "—"}</span>
                  </div>
               </div>

               {/* Panel Body */}
               <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30 p-6">
                  {selectedAgent.status === 'running' ? (
                     <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-16">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <div>
                           <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest block mb-1">Executing Analysis</span>
                           <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Processing evidence context and generating structured logic...</p>
                        </div>
                     </div>
                  ) : selectedAgent.status === 'failed' ? (
                     <div className="p-5 bg-rose-50 rounded-lg border border-rose-100 max-w-2xl mx-auto my-8">
                        <div className="flex items-start gap-4">
                           <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                           <div>
                              <span className="text-[13px] font-bold text-rose-900 block mb-1.5">Process Execution Failed</span>
                              <p className="text-[11px] text-rose-700 mb-3 leading-relaxed">The pipeline encountered an error during contextual extraction. Review upstream blocks or force a retry.</p>
                              <Button size="sm" onClick={() => runSingle(selectedAgent.id)} className="h-7 text-[10px] font-medium bg-rose-600 hover:bg-rose-700 text-white"><RefreshCcw className="h-3 w-3 mr-1.5" /> Initialize Rerun</Button>
                           </div>
                        </div>
                     </div>
                  ) : (selectedAgent.status === 'completed' && selectedAgent.results) ? (
                     <div className="max-w-3xl mx-auto space-y-5">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex-1">Structured Output Log</h4>
                           <Button variant="ghost" size="sm" onClick={() => runSingle(selectedAgent.id)} className="h-6 text-[9px] font-semibold text-primary hover:bg-primary/5 ml-3"><RefreshCcw className="h-2.5 w-2.5 mr-1" /> Re-run</Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                           {Object.entries(selectedAgent.results).map(([key, value]) => (
                              <div key={key} className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{key}</span>
                                 <div className="text-[11px] text-slate-700 leading-relaxed">
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
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-16">
                        <DocIcon className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Extracted Payload</span>
                        <p className="text-[9px] text-slate-400 mt-1">Run the sequence to extract intelligence.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
`;

const text = fs.readFileSync('src/pages/CaseWorkspacePage.tsx', 'utf8');
const start = text.indexOf("type AgentStatus = 'idle'");
const end = text.indexOf("function ReportsTab() {");
const updated = text.slice(0, start) + content + text.slice(end);
fs.writeFileSync('src/pages/CaseWorkspacePage.tsx', updated);
