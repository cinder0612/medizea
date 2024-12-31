"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="bg-black/80 border-amber-500/30 backdrop-blur-sm">
          <div className="grid gap-1">
            {title && <ToastTitle className="text-amber-200 text-lg">{title}</ToastTitle>}
            {description && (
              <ToastDescription className="text-amber-100 text-base">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="text-amber-200 hover:text-amber-100" />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
