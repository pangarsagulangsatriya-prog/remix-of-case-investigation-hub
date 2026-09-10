const fs = require('fs');

function fixFile(file, isIpls) {
    let code = fs.readFileSync(file, 'utf8');
    
    // 1. max-width
    if (isIpls) {
        code = code.replace(
            'className={cn("w-full max-w-[1300px] h-fit shrink-0 overflow-x-auto", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}',
            'className={cn("w-full h-fit shrink-0 overflow-x-auto", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8")}'
        );
    } else {
        code = code.replace(
            'className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}',
            'className={cn("w-full h-fit shrink-0", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16")}'
        );
    }

    // 2. Hide top header in cleanMode
    code = code.replace(
        'className={cn("shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4", readonly ? "hidden" : "")}',
        'className={cn("shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4", cleanMode ? "hidden" : "")}'
    );

    // 3. Inner title hide
    if (isIpls) {
        // Original: 
        // <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Analisa Kejadian</h3>
        // <div className="h-[2px] w-[20%] bg-blue-500 mb-4 mt-1"></div>
        code = code.replace(
            '<h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Analisa Kejadian</h3>\n                       <div className="h-[2px] w-[20%] bg-blue-500 mb-4 mt-1"></div>',
            '{!cleanMode && (<>\n                          <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Analisa Kejadian</h3>\n                          <div className="h-[2px] w-[20%] bg-blue-500 mb-4 mt-1"></div>\n                       </>)}'
        );
    } else {
        // Original:
        // <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Tindakan Perbaikan dan Pencegahan Insiden</h3>
        // <div className="h-[2px] w-[50%] bg-[#8ba861] mb-4 mt-1"></div>
        code = code.replace(
            '<h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Tindakan Perbaikan dan Pencegahan Insiden</h3>\n                 <div className="h-[2px] w-[50%] bg-[#8ba861] mb-4 mt-1"></div>',
            '{!cleanMode && (<>\n                    <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Tindakan Perbaikan dan Pencegahan Insiden</h3>\n                    <div className="h-[2px] w-[50%] bg-[#8ba861] mb-4 mt-1"></div>\n                 </>)}'
        );
    }

    // 4. Tambah buttons
    if (isIpls) {
        code = code.replace(
            /\{!readonly && \(\s*<button\s*onClick=\{\(e\)/g,
            '{!readonly && !cleanMode && (\n                                         <button \n                                            onClick={(e)'
        );
    } else {
        code = code.replace(
            /\{!readonly && \(\s*<tr>\s*<td colSpan=\{4\}/g,
            '{!readonly && !cleanMode && (\n                            <tr>\n                               <td colSpan={4}'
        );
    }

    fs.writeFileSync(file, code);
}

fixFile('src/components/analysis/IplsAnalysisModule.tsx', true);
fixFile('src/components/analysis/PreventionAnalysisModule.tsx', false);
console.log('Fixed IPLS and Prevention modules.');
