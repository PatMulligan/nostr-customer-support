<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ToastRoot, type ToastRootEmits, useForwardPropsEmits } from 'radix-vue'
import { computed } from 'vue'
import { type ToastProps, toastVariants } from '.'
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<ToastProps>(), {
  variant: 'default'
})

const emits = defineEmits<ToastRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ToastRoot
    v-bind="forwarded"
    :class="cn(toastVariants({ variant: props.variant }), 'group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full', props.class)"
    @update:open="onOpenChange"
  >
    <div class="flex gap-3">
      <component 
        v-if="props.icon" 
        :is="props.icon" 
        :class="cn('h-5 w-5 shrink-0', props.iconClass)" 
      />
      <div class="flex flex-col gap-1">
        <slot />
      </div>
    </div>
    <button
      class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      @click="onOpenChange(false)"
    >
      <X class="h-4 w-4" />
      <span class="sr-only">Close</span>
    </button>
  </ToastRoot>
</template>
