"use client";
import { AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export function ErrorBanner() {
  const { error } = useStore();
  if (!error) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">Error al comunicarse con la base de datos</p>
        <p className="text-rose-700/90">{error}</p>
      </div>
    </div>
  );
}
