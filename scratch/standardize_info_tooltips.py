import sys
import re

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the descriptions mapping
descriptions = {
    "Case Summary": "Primary information regarding the current investigation.",
    "Evidence Overview": "Aggregated view of all digital assets and forensic status.",
    "Forensic Actors": "Key individuals and entities identified during scanning.",
    "General Detection": "AI identification of primary subjects and objects.",
    "Environment & PPE": "Contextual analysis of safety equipment and hazards.",
    "AI Extraction Metadata": "Technical logs regarding model performance.",
    "Entity Extraction": "Specific nouns and organizations discovered.",
    "Semantic Summary": "Deep contextual understanding of the document.",
    "Forensic Metadata": "Technical integrity data and OCR confidence.",
    "Audio Properties": "Metadata regarding the capture quality and source.",
    "Speaker Profiles": "Detailed analysis of unique voices found.",
    "Communication Events": "Key conversational milestones and interactions.",
    "Timeline & Facts": "Chronological event extraction for case build-up.",
    "Risks, Gaps, Review": "Procedural anomalies and potential blockers.",
    "Video Session Meta": "Integrity and session data for the video stream.",
    "Scene Timeline": "Temporal segmentation of visual events detected."
}

# Replacement helper for SectionHeader with count
def replace_section_header_with_count(match):
    # This regex is for the newer SectionHeader style
    return """  const SectionHeader = ({ title, icon: Icon, count, description }: any) => (
    <button 
      onClick={() => toggle(title)}
      className={`w-full flex items-center justify-between px-5 py-3 transition-all ${expandedSections.includes(title) ? 'bg-slate-50/50 border-b' : 'hover:bg-slate-50/30'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-sm border  ${expandedSections.includes(title) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col items-start">
           <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-tight ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-600'}`}>
                {title}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-0.5 hover:bg-slate-100 rounded-full transition-colors cursor-help group/info" onClick={(e) => e.stopPropagation()}>
                      <Info className="h-2.5 w-2.5 text-slate-300 group-hover/info:text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white border-slate-800">
                    {descriptions.get(title, "Forensic modality analysis section.")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
           </div>
           {count !== undefined && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">{count} detected</span>}
        </div>
      </div>
      <ChevronDown className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-300 ${expandedSections.includes(title) ? 'rotate-180 text-slate-900' : ''}`} />
    </button>
  );"""

# Replacement helper for ExtractionSection (Video)
def replace_extraction_section(match):
    return """  const ExtractionSection = ({ title, icon: Icon, count, children, description }: any) => (
    <div className="flex flex-col">
      <button 
        onClick={() => toggle(title)}
        className={`w-full flex items-center justify-between px-5 py-3 transition-all ${expandedSections.includes(title) ? 'bg-slate-50/50 border-b' : 'hover:bg-slate-50/30'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-sm border  ${expandedSections.includes(title) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col items-start">
             <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-tight ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-600'}`}>
                  {title}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-0.5 hover:bg-slate-100 rounded-full transition-colors cursor-help group/info" onClick={(e) => e.stopPropagation()}>
                        <Info className="h-2.5 w-2.5 text-slate-300 group-hover/info:text-primary" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white border-slate-800">
                      {descriptions.get(title, "Forensic modality analysis section.")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
             </div>
             {count !== undefined && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">{count} events detected</span>}
          </div>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-300 ${expandedSections.includes(title) ? 'rotate-180 text-slate-900' : ''}`} />
      </button>
      {expandedSections.includes(title) && (
        <div className="p-5 bg-white space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );"""

# Replace all SectionHeader components that have 'count'
pattern_sh = re.compile(r"  const SectionHeader = \(\{ title, icon: Icon, count \}: any\) => \(.*?\);", re.DOTALL)
content = pattern_sh.sub(replace_section_header_with_count, content)

# Replace ExtractionSection
pattern_es = re.compile(r"  const ExtractionSection = \(\{ title, icon: Icon, count, children \}: any\) => \(.*?\);", re.DOTALL)
content = pattern_es.sub(replace_extraction_section, content)

# Special case for the first SectionHeader at 1383 (no count)
pattern_sh_no_count = re.compile(r"  const SectionHeader = \(\{ title, icon: Icon \}: \{ title: string, icon: any \}\) => \(.*?\);", re.DOTALL)
def replace_section_header_no_count(match):
    return """  const SectionHeader = ({ title, icon: Icon, description }: { title: string, icon: any, description?: string }) => (
    <button 
      onClick={() => toggleSection(title)}
      className={`w-full flex items-center justify-between p-4 transition-all border-b ${
        expandedSections.includes(title) ? 'bg-slate-50/80 border-slate-200 shadow-inner' : 'bg-white hover:bg-slate-50/50 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-sm border  flex items-center justify-center transition-all ${
          expandedSections.includes(title) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-start">
           <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{title}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-0.5 hover:bg-slate-100 rounded-full transition-colors cursor-help group/info" onClick={(e) => e.stopPropagation()}>
                      <Info className="h-3 w-3 text-slate-300 group-hover/info:text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white border-slate-800">
                    {descriptions.get(title, "Primary case information section.")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
           </div>
        </div>
      </div>
      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${expandedSections.includes(title) ? 'rotate-180 text-slate-900' : ''}`} />
    </button>
  );"""
content = pattern_sh_no_count.sub(replace_section_header_no_count, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Standardized all section headers with Info tooltips")
