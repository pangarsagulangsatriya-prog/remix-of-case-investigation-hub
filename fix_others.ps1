$files = @(
    'src/pages/CaseWorkspacePage.tsx',
    'src/pages/CaseListPage.tsx'
)

foreach ($p in $files) {
    if (Test-Path $p) {
        $c = [System.IO.File]::ReadAllText($p)
        
        # CaseWorkspacePage.tsx
        $c = $c -replace '\{f\.confidence\.toLowerCase\(\)', '{(f.confidence || "high").toLowerCase()'
        $c = $c -replace '\{p\.confidence\.toLowerCase\(\)', '{(p.confidence || "medium").toLowerCase()'
        $c = $c -replace '\{h\.confidence\.toLowerCase\(\)', '{(h.confidence || "high").toLowerCase()'
        $c = $c -replace '\{n\.confidence\.toLowerCase\(\)', '{(n.confidence || "medium").toLowerCase()'
        
        # CaseListPage.tsx
        $c = $c -replace 'c\.severity\.toLowerCase\(\)', '(c.severity || "medium").toLowerCase()'
        $c = $c -replace 'caseData\.severity\.toLowerCase\(\)', '(caseData.severity || "medium").toLowerCase()'
        $c = $c -replace 'selectedCase\.status\.toUpperCase\(\)', '(selectedCase.status || "draft").toUpperCase()'
        
        [System.IO.File]::WriteAllText($p, $c)
    }
}
