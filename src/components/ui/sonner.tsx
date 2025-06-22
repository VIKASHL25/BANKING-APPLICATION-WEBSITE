
// Simple wrapper for Sonner toast
import { Toaster as SonnerToaster } from "sonner";

interface ToasterProps {
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  richColors?: boolean;
}

export function Toaster({ position = "bottom-right", richColors = false }: ToasterProps) {
  return (
    <SonnerToaster position={position} richColors={richColors} />
  );
}
