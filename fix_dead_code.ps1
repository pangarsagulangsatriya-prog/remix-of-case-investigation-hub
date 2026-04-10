$f = 'src/pages/CaseWorkspacePage.tsx'
$a = Get-Content $f
$b = $a[0..1950] + $a[2119..($a.Count - 1)]
$b | Set-Content $f -Encoding UTF8
Write-Host ('Done: ' + $b.Count + ' lines')
