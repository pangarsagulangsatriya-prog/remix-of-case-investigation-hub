import { AppLayout } from "@/components/AppLayout";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const evidence = [
  { name: "site_inspection_photos.zip", case: "CS-2026-0147", type: "Images", uploadedBy: "Ahmed Khan", extraction: "completed", review: "reviewed", date: "Apr 8" },
  { name: "incident_report_initial.pdf", case: "CS-2026-0147", type: "Document", uploadedBy: "Sarah Chen", extraction: "completed", review: "reviewed", date: "Apr 8" },
  { name: "witness_statement_A.mp3", case: "CS-2026-0147", type: "Audio", uploadedBy: "John Doe", extraction: "completed", review: "partial", date: "Apr 8" },
  { name: "truck_dashcam.mp4", case: "CS-2026-0146", type: "Video", uploadedBy: "System", extraction: "completed", review: "reviewed", date: "Apr 7" },
  { name: "chemical_msds.pdf", case: "CS-2026-0145", type: "Document", uploadedBy: "Maria Santos", extraction: "completed", review: "pending", date: "Apr 7" },
  { name: "spill_photos_batch1.zip", case: "CS-2026-0145", type: "Images", uploadedBy: "Maria Santos", extraction: "processing", review: "pending", date: "Apr 7" },
];

export default function EvidenceGlobalPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar justify-between">
          <span className="text-xs font-medium text-foreground">Global Evidence Library</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Filter className="h-3 w-3" /> Filters</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /> Export</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full enterprise-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Case</th>
                <th>Type</th>
                <th>Uploaded By</th>
                <th>Extraction</th>
                <th>Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((e) => (
                <tr key={e.name} className="cursor-pointer">
                  <td className="text-xs font-medium">{e.name}</td>
                  <td className="font-mono text-xs text-primary">{e.case}</td>
                  <td className="text-xs text-muted-foreground">{e.type}</td>
                  <td className="text-xs">{e.uploadedBy}</td>
                  <td>
                    <span className={`status-chip ${e.extraction === "completed" ? "bg-status-approved/10 text-status-approved" : "bg-status-inprogress/10 text-status-inprogress"}`}>
                      {e.extraction}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip ${e.review === "reviewed" ? "bg-status-approved/10 text-status-approved" : e.review === "partial" ? "bg-status-review/10 text-status-review" : "bg-muted text-muted-foreground"}`}>
                      {e.review}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
