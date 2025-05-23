
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SupabaseClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTicketCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Custom typed table helper to work around Supabase type issues
export function createTypedSupabaseClient(supabaseClient: SupabaseClient) {
  return {
    ...supabaseClient,
    // Override the from method to accept any table name
    from: (table: string) => supabaseClient.from(table as any),
    // Override rpc to accept any function name
    rpc: (fn: string, params?: any) => supabaseClient.rpc(fn as any, params),
  };
}
