$path = 'src/pages/CaseWorkspacePage.tsx'
$c = Get-Content $path
$c[4139] = '                                     </div>'
$c[4140] = '                                  )}'
$c[4141] = '                               </div>'
$c[4142] = '                            )}'
$c[4143] = '                         </div>'
$c[4144] = '                      </div>'
$c | Set-Content $path
