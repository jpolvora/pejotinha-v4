import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      if (props.variant === 'destructive') {
        sonnerToast.error(props.title, { description: props.description })
      } else {
        sonnerToast.success(props.title, { description: props.description })
      }
    }
  }
}
