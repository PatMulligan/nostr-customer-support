<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ToastTitle as ToastTitlePrimitive } from 'radix-vue'

const props = defineProps<{
  class?: string
  titleClass?: string
}>()
</script>

<template>
  <ToastTitlePrimitive :class="cn('text-sm font-semibold', [props.class, props.titleClass])">
    <slot />
  </ToastTitlePrimitive>
</template>
