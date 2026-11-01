import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const mobileNavOpen = ref(false);

  function openMobileNav() {
    mobileNavOpen.value = true;
  }

  function closeMobileNav() {
    mobileNavOpen.value = false;
  }

  function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value;
  }

  return { mobileNavOpen, openMobileNav, closeMobileNav, toggleMobileNav };
});
