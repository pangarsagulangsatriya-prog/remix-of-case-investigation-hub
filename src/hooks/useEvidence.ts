import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

function getFallbackMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov': return 'video/quicktime';
    case 'mkv': return 'video/x-matroska';
    case 'avi': return 'video/x-msvideo';
    case 'm4v': return 'video/x-m4v';
    case '3gp': return 'video/3gpp';
    case 'ts': return 'video/mp2t';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'm4a': return 'audio/mp4';
    case 'aac': return 'audio/aac';
    case 'ogg': return 'audio/ogg';
    case 'flac': return 'audio/flac';
    case 'txt': return 'text/plain';
    case 'csv': return 'text/csv';
    default: return 'application/octet-stream';
  }
}

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
  batch_id: string | null;
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
      // 1. Fetch batches for this case
      const { data: batches, error: batchesError } = await supabase
        .from("evidence_batches")
        .select("*")
        .eq("case_id", caseId);

      if (batchesError) throw batchesError;

      // 2. Fetch files belonging to these batches
      const batchIds = (batches || []).map(b => b.id);
      if (batchIds.length === 0) {
        return { batches, files: [] as EvidenceFile[] };
      }

      const { data: files, error: filesError } = await supabase
        .from("evidence_files")
        .select("*")
        .in("batch_id", batchIds);

      if (filesError) {
         return { batches, files: [] as EvidenceFile[] };
      }

      return { batches, files: files as EvidenceFile[] };
    },
    enabled: !!caseId,
  });
}

export function useMoveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, batchId }: { fileId: string, batchId: string | null }) => {
      const { error } = await supabase
        .from("evidence_files")
        .update({ batch_id: batchId })
        .eq("id", fileId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ["evidence"] });
    }
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
         const parts = url.split("/storage/v1/object/public/")[1]?.split("/");
         if (parts && parts.length >= 2) {
            const bucket = parts[0];
            const path = parts.slice(1).join("/");
            await supabase.storage.from(bucket).remove([path]);
         }
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
      const insertedFileIds: string[] = [];

      for (const group of groups) {
        // 1. Create batch for EVERY group (Folder or Loose Files) 
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
        const batchId = batchData.id;

        // 2. Upload files and create records
        for (const fileItem of group.files) {
          const file = fileItem.file; 
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const fileName = `${Date.now()}-${sanitizedFileName}`;
          const filePath = `${caseId}/${batchId}/${fileName}`;
          
          let publicUrl = "";

          try {
            const contentType = file.type || getFallbackMimeType(file.name);
            console.log(`Uploading ${file.name} to ${filePath} with type ${contentType}...`);
            
            const { error: uploadError } = await supabase.storage
              .from("evidence")
              .upload(filePath, file, {
                 upsert: true,
                 contentType: contentType,
                 cacheControl: '3600'
              });

            if (uploadError) {
              console.error("Supabase Storage Upload Error:", uploadError);
              // Check for common errors
              if (uploadError.message.includes("bucket not found")) {
                throw new Error("Storage Bucket 'evidence' not found. Please create it in Supabase Dashboard.");
              }
              if (uploadError.message.includes("Payload Too Large")) {
                throw new Error("File too large. Maximum upload size exceeded.");
              }
              throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
              .from("evidence")
              .getPublicUrl(filePath);
            publicUrl = publicUrlData.publicUrl;
          } catch (e: any) {
            console.error("Storage error:", e);
            toast.error(`Upload failed for ${file.name}: ${e.message || 'Unknown error'}`);
            throw e; 
          }

          const { data: fileData, error: fileError } = await supabase
            .from("evidence_files")
            .insert({
              batch_id: batchId,
              name: file.name,
              type: fileItem.category || "Document",
              size: formatBytes(file.size),
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
            })
            .select()
            .single();

          if (fileError) throw fileError;
          if (fileData) insertedFileIds.push(fileData.id);
        }
      }

      // 3. Trigger dummy completion in the background for testing:
      // Uploading (pending) lasts 20 seconds.
      // Processing lasts 30 seconds (completes at 50 seconds total).
      if (insertedFileIds.length > 0) {
        // Step A: Transition from uploading (pending) to processing at 20 seconds
        setTimeout(async () => {
          await supabase
            .from("evidence_files")
            .update({ extraction_status: "processing" })
            .in("id", insertedFileIds);
          queryClient.invalidateQueries({ queryKey: ["evidence", caseId] });
        }, 20000);

        // Step B: Transition from processing to completed at 50 seconds
        setTimeout(async () => {
          await supabase
            .from("evidence_files")
            .update({ extraction_status: "completed" })
            .in("id", insertedFileIds);
          queryClient.invalidateQueries({ queryKey: ["evidence", caseId] });
        }, 50000);
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence", variables.caseId] });
    },
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, name }: { caseId: string, name: string }) => {
      const { data, error } = await supabase
        .from("evidence_batches")
        .insert({
          case_id: caseId,
          name: name,
          file_count: 0,
          type: "Folder",
          uploaded_by: "Admin"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence", variables.caseId] });
    },
  });
}
export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("evidence_batches")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      // Invalidate all evidence queries to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
    // Ensure we refetch even if there was a minor hiccup
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ["evidence"] });
    }
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      const { error } = await supabase
        .from("evidence_batches")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
}

export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      const { error } = await supabase
        .from("evidence_files")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
}

export function useInsertAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: any) => {
      const { error } = await supabase
        .from("audit_logs")
        .insert(log);

      if (error) throw error;
      return true;
    },
  });
}
export function useRerunExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // 1. Set to pending (uploading) first
      const { error: pendingError } = await supabase
        .from("evidence_files")
        .update({ 
          extraction_status: "pending",
          updated_at: new Date().toISOString() // Force timestamp update for timer reset
        })
        .eq("id", id);

      if (pendingError) throw pendingError;
      queryClient.invalidateQueries({ queryKey: ["evidence"] });

      // Simulate 20 seconds in pending (uploading) stage
      await new Promise(resolve => setTimeout(resolve, 20000));

      // 2. Set to processing
      const { error: procError } = await supabase
        .from("evidence_files")
        .update({ 
          extraction_status: "processing",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (procError) throw procError;
      queryClient.invalidateQueries({ queryKey: ["evidence"] });

      // Simulate 30 seconds in processing stage
      await new Promise(resolve => setTimeout(resolve, 30000));

      // 3. Set to completed
      const { error: endError } = await supabase
        .from("evidence_files")
        .update({ 
          extraction_status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (endError) throw endError;
      return true;
    },
    onSuccess: () => {
      // Final invalidation to ensure UI reflects completion
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ["evidence"] });
    }
  });
}
