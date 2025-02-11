<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-vue-next'

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}
</script>

<template>
  <Button 
    variant="ghost" 
    size="icon"
    @click="toggleTheme"
    class="relative group"
  >
    <div class="absolute -inset-1 bg-gradient-to-r from-[#f9e2af] to-[#89b4fa] rounded-full opacity-0 group-hover:opacity-75 blur transition duration-300"></div>
    <div class="relative h-9 w-9 rounded-full bg-gradient-to-br from-[#313244] to-[#45475a] flex items-center justify-center shadow-lg group-hover:shadow-xl transition duration-300 overflow-hidden">
      <div class="relative w-full h-full">
        <Sun 
          class="absolute inset-0 h-4 w-4 m-auto text-[#f9e2af] transition-all duration-500 ease-spring"
          :class="isDark ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'"
        />
        <Moon 
          class="absolute inset-0 h-4 w-4 m-auto text-[#89b4fa] transition-all duration-500 ease-spring"
          :class="isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'"
        />
      </div>
    </div>
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<style scoped>
/* Improved focus styles */
:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
  transition: outline-offset 0.2s ease;
}

/* Enhanced button hover states */
button:not(:disabled):hover {
  transform: translateY(-1px) scale(1.01);
}

button:not(:disabled):active {
  transform: translateY(0) scale(0.99);
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Custom spring easing for icon animations */
.ease-spring {
  transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Glass morphism effects */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style> 