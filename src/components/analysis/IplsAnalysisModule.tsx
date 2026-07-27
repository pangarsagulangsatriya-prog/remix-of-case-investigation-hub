import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, X, Pencil, Shield } from "lucide-react";

export interface IplsItem {
  id: string;
  label: string;
  status: string; // "", "rootcause", "non-conformity", "improvement"
  originalIndex: number;
  description?: string;
}

export interface IplsLayer {
  id: number;
  title: string;
  items: IplsItem[];
}

export interface IplsData {
  layers: IplsLayer[];
}

interface IplsAnalysisModuleProps {
  data: IplsData;
  onSelectRow?: (id: string) => void;
  selectedRowId?: string | null;
  onSync: (newData: IplsData) => void;
}

export function IplsAnalysisModule({ data, onSelectRow, selectedRowId, onSync }: IplsAnalysisModuleProps) {
  const [editingItem, setEditingItem] = useState<{ layerId: number; item: IplsItem } | null>(null);
  const [editForm, setEditForm] = useState<Partial<IplsItem>>({});

  const layers = data?.layers || [];

  const handleEditClick = (layerId: number, item: IplsItem) => {
    setEditingItem({ layerId, item });
    setEditForm({
      label: item.label,
      description: item.description || "",
      status: item.status || "",
    });
  };

  const handleSave = () => {
    if (!editingItem) return;

    const newLayers = layers.map((layer) => {
      if (layer.id === editingItem.layerId) {
        return {
          ...layer,
          items: layer.items.map((it) => {
            if (it.id === editingItem.item.id) {
              return {
                ...it,
                label: editForm.label || "",
                description: editForm.description || "",
                status: editForm.status || "",
              };
            }
            return it;
          }),
        };
      }
      return layer;
    });

    onSync({ ...data, layers: newLayers });
    setEditingItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      {/* Title Bar */}
      <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              IPLS - BUMA LMO - NM LV BM 391
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Validasi dan evaluasi lapisan proteksi sistem bekerja selamat.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-6 scrollbar-thin">
        <div className="min-w-[1000px] flex w-full">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Section 4: Analisa Kejadian */}
            <div className="mt-4 mb-4">
              <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">4. Analisa Kejadian</h3>
              <h4 className="font-bold text-[14px] text-slate-900 mb-2">IPLS &ndash; BUMA LMO &ndash; NM LV BM 391</h4>

              {/* Header bar */}
              <div className="relative h-6 bg-[#a3a6aa] flex items-center justify-center w-full mb-3">
                <div className="absolute -left-3 top-0 w-0 h-0 border-y-[12px] border-y-transparent border-r-[12px] border-r-[#a3a6aa]"></div>
                <span className="text-white font-bold text-xs tracking-wide">Investigation</span>
              </div>

              {/* Columns Grid */}
              <div className="grid grid-cols-5 gap-3">
                {layers.map((layer: IplsLayer, colIdx: number) => {
                  const findingItems = layer.items.filter((i: IplsItem) => i.status);
                  return (
                    <div key={layer.id} className="flex flex-col h-full border-r border-dashed border-slate-300 last:border-r-0 pr-3 min-h-[150px]">
                      {/* Layer Header */}
                      <div className="text-center font-bold text-[12px] mb-3 italic text-slate-800">
                        Layer {["I", "II", "III", "IV", "V"][colIdx]}
                      </div>

                      {/* Findings */}
                      <div className="flex-1 space-y-4">
                        {findingItems.map((item: IplsItem) => {
                          const num = item.originalIndex || 0;
                          let bgColor = "";
                          let textColor = "text-slate-900";
                          if (item.status === 'rootcause') {
                            bgColor = "bg-red-600 border-red-600 hover:bg-red-700";
                            textColor = "text-white";
                          } else if (item.status === 'non-conformity') {
                            bgColor = "bg-[#ffc000] border-[#ffc000] hover:bg-amber-500";
                          } else if (item.status === 'improvement') {
                            bgColor = "bg-[#00c950] border-[#00c950] hover:bg-emerald-600";
                          }

                          const isSelected = item.id === selectedRowId;
                          return (
                            <div 
                              key={item.id} 
                              className={`flex flex-col cursor-pointer group relative p-2 rounded-md transition-all ${isSelected ? 'bg-slate-100/80 ring-1 ring-slate-300' : 'hover:bg-slate-50/50'}`}
                              onClick={() => onSelectRow ? onSelectRow(item.id) : handleEditClick(layer.id, item)}
                            >
                               <div className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
                                 <Pencil className="h-3 w-3" />
                               </div>
                              <div className={`text-[10px] font-bold text-center py-1.5 px-2 rounded-sm border shadow-sm mb-1.5 transition-colors ${bgColor} ${textColor}`}>
                                {num}. {item.label}
                              </div>
                              {item.description && (
                                <p className="text-[9px] text-slate-700 leading-[1.4] font-medium text-justify group-hover:text-slate-900 transition-colors">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend 2 */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-200">
                <div className="bg-[#091b4c] text-white text-[11px] font-bold px-8 py-1.5 rounded-sm uppercase tracking-wide">
                  Legend
                </div>
                <div className="flex items-center gap-6 text-[11px] font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-3 rounded-sm bg-red-400 border border-red-500"></div>
                    <span>Rootcause</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-3 rounded-sm bg-[#ffc000] border border-amber-500"></div>
                    <span>Non Confirmity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-3 rounded-sm bg-[#00c950] border border-emerald-600"></div>
                    <span>Improvement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Investigation Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-bold text-slate-700">Label Activity</label>
              <input
                type="text"
                value={editForm.label || ""}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-bold text-slate-700">Status Findings</label>
              <select
                value={editForm.status || ""}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              >
                <option value="">None (Safe / Not selected)</option>
                <option value="rootcause">Rootcause (Merah)</option>
                <option value="non-conformity">Non Conformity (Kuning)</option>
                <option value="improvement">Improvement (Hijau)</option>
              </select>
            </div>
            {editForm.status && (
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Deskripsi Kejadian / Keterangan</label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  placeholder="Deskripsikan temuan ini..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
