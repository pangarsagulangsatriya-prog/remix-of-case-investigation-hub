import sys

file_path = r'c:\\Users\\Feedloop\\OneDrive\\Desktop\\Demo File\\remix-of-case-investigation-hub\\src\\pages\\CaseWorkspacePage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the transition.
target_idx = -1
for i in range(len(lines)):
    if 'item.status' in lines[i] and '</div>' in lines[i+7] and 'selectedAgentId === \'prev\'' in lines[i+8]:
        target_idx = i + 7
        break

if target_idx != -1:
    print(f"Found transition at line {target_idx + 1}")
    
    closing_tags = """                                                                              </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}
                                                  </div>
                                               </div>
                                            </div>
"""
    
    final_lines = lines[:target_idx + 1] + [closing_tags] + lines[target_idx+1:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)
    print("Successfully restored closing tags.")
else:
    print("Could not find transition.")
    sys.exit(1)
