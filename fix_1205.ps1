$p = 'src/pages/CaseWorkspacePage.tsx'
$c = [System.IO.File]::ReadAllText($p)
$c = $c -replace '\{item\.visibility\?\.toUpperCase\(\) \|\| " N/A\\\}', '{item.visibility?.toUpperCase() || "N/A"}'
[System.IO.File]::WriteAllText($p, $c)
