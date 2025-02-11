import type { ToastProps } from '.'
import { computed, ref } from 'vue'
import { Check, AlertCircle } from 'lucide-vue-next'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000

export type ToastActionElement = {
  altText: string
  onClick: () => void
  text: string
}

interface Toast extends ToastProps {
  id?: string
  title?: string
  description?: string
  action?: ToastActionElement
  duration?: number
  iconClass?: string
  titleClass?: string
}

type ToasterToast = Required<Pick<Toast, 'id'>> & Toast

const toasts = ref<ToasterToast[]>([])

function createToast() {
  function addToast(toast: Toast) {
    toasts.value = [...toasts.value, { ...toast, id: crypto.randomUUID() }]
  }

  function dismissToast(toastId: string) {
    const index = toasts.value.findIndex((toast) => toast.id === toastId)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function toast(props: Toast) {
    addToast(props)
  }

  toast.success = (props: Omit<Toast, 'variant' | 'id'>) => {
    return toast({
      ...props,
      variant: 'default',
      icon: Check,
      iconClass: 'text-[#a6e3a1]',
      titleClass: 'text-[#a6e3a1]'
    })
  }

  toast.error = (props: Omit<Toast, 'variant' | 'id'>) => {
    return toast({
      ...props,
      variant: 'destructive',
      icon: AlertCircle
    })
  }

  return {
    toasts: computed(() => toasts.value),
    toast,
    dismissToast
  }
}

export const { toast, dismissToast } = createToast()

export function useToast() {
  return {
    toasts: computed(() => toasts.value),
    toast,
    dismissToast
  }
}

export type { Toast }
