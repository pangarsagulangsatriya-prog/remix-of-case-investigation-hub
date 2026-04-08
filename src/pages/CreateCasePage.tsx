import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload } from "lucide-react";

export default function CreateCasePage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Create New Case</span>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex gap-6 p-6 max-w-5xl">
            {/* Form */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block">Case Title *</label>
                  <Input className="h-8 text-sm" placeholder="Brief description of the incident" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Incident Date & Time *</label>
                  <Input type="datetime-local" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Site / Location *</label>
                  <select className="w-full h-8 text-sm border rounded px-2 bg-background">
                    <option>Select site...</option>
                    <option>Site Alpha</option>
                    <option>Site Beta</option>
                    <option>Site Gamma</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Business Unit</label>
                  <select className="w-full h-8 text-sm border rounded px-2 bg-background">
                    <option>Select unit...</option>
                    <option>Mining Operations</option>
                    <option>Processing</option>
                    <option>Transport</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Severity *</label>
                  <select className="w-full h-8 text-sm border rounded px-2 bg-background">
                    <option>Select severity...</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Incident Type</label>
                  <select className="w-full h-8 text-sm border rounded px-2 bg-background">
                    <option>Select type...</option>
                    <option>Equipment Failure</option>
                    <option>Near Miss</option>
                    <option>Injury</option>
                    <option>Environmental</option>
                    <option>Vehicle Incident</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Reporter</label>
                  <Input className="h-8 text-sm" placeholder="Who reported this incident?" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block">Initial Description *</label>
                  <Textarea className="text-sm min-h-[80px]" placeholder="Describe what happened..." />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Assign Investigator</label>
                  <select className="w-full h-8 text-sm border rounded px-2 bg-background">
                    <option>Select investigator...</option>
                    <option>Sarah Chen</option>
                    <option>John Doe</option>
                    <option>Maria Santos</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Tags</label>
                  <Input className="h-8 text-sm" placeholder="e.g. conveyor, zone-b, mechanical" />
                </div>
              </div>

              {/* Upload zone */}
              <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  Drop initial evidence files here or{" "}
                  <span className="text-primary">browse</span>
                </p>
                <p className="text-2xs text-muted-foreground mt-1">PDF, images, audio, documents up to 50MB each</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="h-8 text-xs" onClick={() => navigate("/cases/CS-2026-0148")}>
                  Create Case
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Save Draft
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate("/cases")}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Right guidance panel */}
            <div className="w-64 shrink-0">
              <div className="border rounded-md">
                <div className="px-3 py-2 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold">Investigation Checklist</span>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { label: "Set case title", required: true },
                    { label: "Set incident date", required: true },
                    { label: "Select site", required: true },
                    { label: "Set severity", required: true },
                    { label: "Write description", required: true },
                    { label: "Assign investigator", required: false },
                    { label: "Upload initial evidence", required: false },
                    { label: "Add tags", required: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-border" />
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                        {item.required && <span className="text-destructive ml-0.5">*</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md mt-3">
                <div className="px-3 py-2 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold">Next Steps</span>
                </div>
                <div className="p-3">
                  <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Create the case with basic info</li>
                    <li>Upload all available evidence</li>
                    <li>Run AI extraction on evidence</li>
                    <li>Review extracted facts</li>
                    <li>Launch analysis agents</li>
                    <li>Build investigation report</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
