import os

with open("src/pages/QuestionBankPage.tsx", "r") as f:
    text = f.read()

# Add imports
import_str = "import { QuestionBankApiIntegration } from '@/components/workspace/QuestionBankApiIntegration';\n"
text = text.replace("import { AppSidebar } from '@/components/AppSidebar';", import_str + "import { AppSidebar } from '@/components/AppSidebar';")

# Add state
state_str = "  const [activeMode, setActiveMode] = useState<'DEMO1' | 'DEMO2' | 'DEMO3'>('DEMO1');\n"
text = text.replace("  const [pageState, setPageState] = useState<PageState>('EMPTY');", state_str + "  const [pageState, setPageState] = useState<PageState>('EMPTY');")

# Add mode selector in header
header_from = """          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-700" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-600" />
              <h1 className="font-bold text-[15px] text-slate-800 tracking-tight">Question Bank</h1>
            </div>
          </div>"""

header_to = """          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-700" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-600" />
              <h1 className="font-bold text-[15px] text-slate-800 tracking-tight">Question Bank</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 ml-4 absolute left-1/2 -translate-x-1/2">
            <button onClick={() => setActiveMode('DEMO1')} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all", activeMode === 'DEMO1' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Demo 1: PDF</button>
            <button onClick={() => setActiveMode('DEMO2')} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all", activeMode === 'DEMO2' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Demo 2: LPI ID</button>
            <button onClick={() => setActiveMode('DEMO3')} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all", activeMode === 'DEMO3' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Demo 3: API</button>
          </div>"""

text = text.replace(header_from, header_to)

# Render logic
main_from = """        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col max-w-5xl mx-auto w-full">"""
main_to = """        <main className={cn("flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col mx-auto w-full", activeMode === 'DEMO3' ? "max-w-[1400px]" : "max-w-5xl")}>"""

text = text.replace(main_from, main_to)

# Hide content if not DEMO1
# Since Demo 2 and 1 are grouped, we can just say `activeMode !== 'DEMO3'`
content_from = """          {(pageState === 'EMPTY' || pageState === 'FILE_READY' || pageState === 'GENERATING' || pageState === 'ERROR') && ("""
content_to = """          {activeMode === 'DEMO3' ? <QuestionBankApiIntegration /> : activeMode === 'DEMO2' ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-20">
              <FileSearch className="w-12 h-12 mb-4 text-slate-300" />
              <h2 className="text-xl font-bold mb-2 text-slate-800">Demo 2: Generate dari ID</h2>
              <p className="text-sm">Fitur ini masih dalam tahap pengembangan.</p>
            </div>
          ) : (pageState === 'EMPTY' || pageState === 'FILE_READY' || pageState === 'GENERATING' || pageState === 'ERROR') && ("""

text = text.replace(content_from, content_to)

# Add closing bracket for DEMO 1 wrapper
end_from = """            </div>
          )}
        </main>"""
end_to = """            </div>
          )}
        </main>"""

# Since DEMO 1 has two main blocks: (EMPTY|FILE_READY...) and QUESTION_READY, we need to wrap QUESTION_READY too.
# Actually, I used a ternary in `content_to`. Wait, it will break React if I don't wrap properly.
# Let's fix the JSX structure using proper replacements.

text = text.replace(content_to, """          {activeMode === 'DEMO3' && <QuestionBankApiIntegration />}
          {activeMode === 'DEMO2' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-20">
              <FileSearch className="w-12 h-12 mb-4 text-slate-300" />
              <h2 className="text-xl font-bold mb-2 text-slate-800">Demo 2: Generate dari ID</h2>
              <p className="text-sm">Fitur pencarian ID sedang dalam tahap pengembangan.</p>
            </div>
          )}
          {activeMode === 'DEMO1' && (pageState === 'EMPTY' || pageState === 'FILE_READY' || pageState === 'GENERATING' || pageState === 'ERROR') && (""")

text = text.replace("""          {pageState === 'QUESTION_READY' && (""", """          {activeMode === 'DEMO1' && pageState === 'QUESTION_READY' && (""")
text = text.replace("""          {pageState === 'QUESTION_READY' && (""", """          {activeMode === 'DEMO1' && pageState === 'QUESTION_READY' && (""") # Just in case it appears in header too. Wait, header is fine.

with open("src/pages/QuestionBankPage.tsx", "w") as f:
    f.write(text)

