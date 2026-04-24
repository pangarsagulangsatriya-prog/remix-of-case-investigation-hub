import sys

def fix_file():
    path = r'c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find line 4101 (1-indexed) -> 4100 (0-indexed)
    # It should be a closing div.
    
    idx = 4100
    if "</div>" in lines[idx]:
        selector_code = [
            '\n',
            '                         {/* Knowledge Selector (Optimistic Inline UI) */}\n',
            '                         {knowledgeAgentId === agent.id && (\n',
            '                            <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">\n',
            '                               <div className="flex items-center justify-between mb-3">\n',
            '                                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">\n',
            '                                     <BookOpen className="h-3 w-3 text-emerald-500" /> Knowledge Selection\n',
            '                                  </span>\n',
            '                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{agent.knowledgeSelection?.length} Folders</span>\n',
            '                               </div>\n',
            '                               <div className="space-y-1.5">\n',
            "                                  {['Audio Recording', 'Internal Document', 'External Document', 'Photos & Media'].map((folder) => {\n",
            '                                     const isSelected = agent.knowledgeSelection?.includes(folder);\n',
            '                                     return (\n',
            '                                        <div \n',
            '                                           key={folder}\n',
            '                                           onClick={(e) => {\n',
            '                                              e.stopPropagation();\n',
            '                                              setAgents(prev => prev.map(a => a.id === agent.id ? {\n',
            '                                                 ...a,\n',
            '                                                 knowledgeSelection: isSelected \n',
            '                                                    ? a.knowledgeSelection?.filter(f => f !== folder)\n',
            '                                                    : [...(a.knowledgeSelection || []), folder]\n',
            '                                              } : a));\n',
            '                                           }}\n',
            '                                           className={cn(\n',
            '                                              "flex items-center justify-between p-2 rounded-sm cursor-pointer transition-all border",\n',
            '                                              isSelected ? "bg-emerald-50 border-emerald-100 shadow-sm" : "bg-slate-50/50 border-transparent hover:bg-slate-50"\n',
            '                                           )}\n',
            '                                        >\n',
            '                                           <span className={cn("text-[9px] font-bold uppercase tracking-tight", isSelected ? "text-emerald-700" : "text-slate-500")}>\n',
            '                                              {folder}\n',
            '                                           </span>\n',
            '                                           <div className={cn(\n',
            '                                              "h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-all",\n',
            '                                              isSelected ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200"\n',
            '                                           )}>\n',
            '                                              {isSelected && <Check className="h-2 w-2 text-white stroke-[4]" />}\n',
            '                                           </div>\n',
            '                                        </div>\n',
            '                                     );\n',
            '                                  })}\n',
            '                               </div>\n',
            '                               <div className="mt-4 flex items-center gap-2">\n',
            '                                  <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">\n',
            '                                     <div \n',
            '                                        className="h-full bg-emerald-500 transition-all duration-500" \n',
            '                                        style={{ width: `${((agent.knowledgeSelection?.length || 0) / 4) * 100}%` }} \n',
            '                                     />\n',
            '                                  </div>\n',
            '                                  <span className="text-[8px] font-black text-slate-300 uppercase">Coverage</span>\n',
            '                               </div>\n',
            '                            </div>\n',
            '                         )}\n'
        ]
        lines[idx:idx] = selector_code
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Step 2 Success")
    else:
        print(f"Mismatch at 4100: {repr(lines[idx])}")

if __name__ == "__main__":
    fix_file()
