import type { ToastRootProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { type Component } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'

export { default as Toast } from './Toast.vue'
export { default as ToastAction } from './ToastAction.vue'
export { default as ToastClose } from './ToastClose.vue'
export { default as ToastDescription } from './ToastDescription.vue'
export { default as Toaster } from './Toaster.vue'
export { default as ToastProvider } from './ToastProvider.vue'
export { default as ToastTitle } from './ToastTitle.vue'
export { default as ToastViewport } from './ToastViewport.vue'
export { toast, useToast } from './use-toast'

export const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border-[#45475a] bg-[#1e1e2e] text-[#cdd6f4]',
        destructive:
          'destructive group border-red-900/50 bg-red-950 text-red-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type ToastVariants = VariantProps<typeof toastVariants>

export interface ToastProps extends ToastRootProps {
  class?: HTMLAttributes['class']
  variant?: ToastVariants['variant']
  title?: string
  description?: string
  duration?: number
  icon?: Component
  iconClass?: string
  titleClass?: string
  onOpenChange?: ((value: boolean) => void) | undefined
}
