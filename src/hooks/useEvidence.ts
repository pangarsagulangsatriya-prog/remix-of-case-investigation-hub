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

export function useUploadEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, groups }: { caseId: string, groups: any[] }) => {
      for (const group of groups) {
        // 1. Create batch (folder)
        const { data: batchData, error: batchError } = await supabase
          .from("evidence_batches")
          .insert({
            case_id: caseId,
            name: group.name,
            file_count: group.files.length,
            type: group.isFolder ? "Folder" : "Loose Files",
            uploaded_by: "Admin"
          })
          .select()
          .single();

        if (batchError) throw batchError;

        // 2. Upload files and create records
        for (const fileItem of group.files) {
          const file = fileItem.file; // The actual File object
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${caseId}/${batchData.id}/${fileName}`;
          
          let publicUrl = "";

          try {
            const { error: uploadError } = await supabase.storage
              .from("evidence")
              .upload(filePath, file, {
                 upsert: true,
                 contentType: file.type || 'application/octet-stream',
                 cacheControl: '3600'
              });

            if (uploadError) {
              console.warn("Upload failed (bucket might not exist), falling back to local simulation.", uploadError);
              // Fallback to local simulation
              publicUrl = URL.createObjectURL(file);
            } else {
              const { data: publicUrlData } = supabase.storage
                .from("evidence")
                .getPublicUrl(filePath);
              publicUrl = publicUrlData.publicUrl;
            }
          } catch (e) {
            console.warn("Storage exception, falling back.", e);
            publicUrl = URL.createObjectURL(file);
          }

          const { error: fileError } = await supabase
            .from("evidence_files")
            .insert({
              batch_id: batchData.id,
              name: file.name,
              type: fileItem.type || "Document",
              size: fileItem.size || "0 KB",
              url: publicUrl,
              source: "External Intake",
              extraction_status: "pending",
              review_status: "pending",
              metadata: {
                 relativePath: fileItem.relativePath,
                 simulated: publicUrl.startsWith("blob:"),
                 originalName: file.name,
                 uploadedAt: new Date().toISOString()
              }
            });

          if (fileError) throw fileError;
        }
      }
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence", variables.caseId] });
    },
  });
}
