
import { toast as sonnerToast } from "sonner";
import { useToast as useToastShadcn } from "@/components/ui/use-toast";

export const toast = sonnerToast;

export function useToast() {
  const shadcnToast = useToastShadcn();
  return {
    toast,
    toasts: []
  };
}