import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AuditLog {
  id: string;
  case_id: string;
  user_name: string;
  action: string;
  entity_type?: string;
  entity_name?: string;
  created_at: string;
}

// Global active user fallback since no full auth is wired up yet
const CURRENT_USER = "System Auditor";

export function useAuditLogs(caseId: string) {
  return useQuery({
    queryKey: ["audit_logs", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      // Fallback if DB doesn't exist yet
      if (error && error.code === "42P01") {
         console.warn("audit_logs table missing, returning empty array");
         return [];
      } else if (error) {
         throw error;
      }
      return data as AuditLog[];
    },
    enabled: !!caseId,
  });
}

export function useInsertAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<AuditLog, "id" | "created_at" | "user_name">) => {
      const { data, error } = await supabase
        .from("audit_logs")
        .insert({
           ...log,
           user_name: CURRENT_USER
        })
        .select()
        .single();

      if (error && error.code === "42P01") {
         console.warn("Audit logs table missing. Mocking success.");
         return log;
      } else if (error) {
         throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.case_id) {
        queryClient.invalidateQueries({ queryKey: ["audit_logs", variables.case_id] });
      }
    },
  });
}
