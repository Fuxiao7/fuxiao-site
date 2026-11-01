import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getMe, login as apiLogin } from "@/api/auth";
import { TOKEN_KEY, USER_KEY } from "@/api/http";
import type { User } from "@/types";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || "");
  const user = ref<User | null>(readStoredUser());
  const loading = ref(false);

  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const displayName = computed(() => user.value?.nickname || user.value?.username || "拂晓");
  const initial = computed(() => displayName.value.slice(0, 1));

  function setUser(next: User | null) {
    user.value = next;
    if (next) {
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  async function login(username: string, password: string) {
    loading.value = true;
    try {
      const result = await apiLogin({ username: username.trim(), password });
      token.value = result.token;
      localStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      return result.user;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value) return null;
    const me = await getMe();
    setUser(me);
    return me;
  }

  function logout() {
    token.value = "";
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return { token, user, loading, isAdmin, displayName, initial, login, fetchMe, setUser, logout };
});
