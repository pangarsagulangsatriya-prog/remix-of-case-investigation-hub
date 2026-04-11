import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type EvidenceBatch = {
  id: string;
  case_id: string;
  name: string;
  description: string;
  type: string;
  file_count: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};

export type EvidenceFile = {
  id: string;
  batch_id: string;
  name: string;
  type: string;
  source: string;
  url: string;
  size: string;
  extraction_status: "pending" | "processing" | "completed" | "failed";
  review_status: "pending" | "partial" | "reviewed";
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
};

export function useEvidence(caseId: string) {
  return useQuery({
    queryKey: ["evidence", caseId],
    queryFn: async () => {
      // Fetch batches
      const { data: batches, error: batchesError } = await supabase
        .from("evidence_batches")
        .select("*")
        .eq("case_id", caseId);

      if (batchesError) throw batchesError;

      // Fetch files for all batches in this case
      const batchIds = batches.map(b => b.id);
      if (batchIds.length === 0) return { batches: [], files: [] };

      const { data: files, error: filesError } = await supabase
        .from("evidence_files")
        .select("*")
        .in("batch_id", batchIds);

      if (filesError) throw filesError;

      return { batches, files: files as EvidenceFile[] };
    },
    enabled: !!caseId,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, url }: { id: string, url: string }) => {
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from("evidence_files")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // 2. Delete from storage if URL is a Supabase storage URL
      if (url && url.includes("storage/v1/object/public")) {
         const path = url.split("/").slice(-2).join("/"); // bucket/filename
         const [bucket, filename] = path.split("/");
         await supabase.storage.from(bucket).remove([filename]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
}
