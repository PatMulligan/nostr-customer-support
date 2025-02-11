import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'dark')

  // Watch for theme changes and update localStorage and document class
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    updateTheme(newTheme)
  })

  // Initialize theme
  function init() {
    updateTheme(theme.value)
  }

  // Update theme helper
  function updateTheme(newTheme: string) {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle theme
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    toggleTheme,
    init
  }
}) 