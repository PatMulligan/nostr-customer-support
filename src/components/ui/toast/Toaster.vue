<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useToast } from './use-toast'
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '.'

const { toasts } = useToast()
</script>

<template>
  <ToastProvider>
    <ToastViewport />
    <template v-for="toast in toasts" :key="toast.id">
      <Toast v-bind="toast">
        <div class="grid gap-1">
          <ToastTitle :class="toast.titleClass">{{ toast.title }}</ToastTitle>
          <ToastDescription>{{ toast.description }}</ToastDescription>
        </div>
      </Toast>
    </template>
  </ToastProvider>
</template>
