
import { Store } from "@tanstack/react-store";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
}

interface AppState {
  token: string | null;
  user: AuthUser | null;
  theme: "light" | "dark";
}

function loadInitialState(): AppState {
  const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const storedAuth = localStorage.getItem("auth");
  if (storedAuth) {
    const { user, token } = JSON.parse(storedAuth);
    return { user, token, theme: storedTheme ?? "light" };
  }
  return { user: null, token: null, theme: storedTheme ?? "light" };
}

export const appStore = new Store<AppState>(loadInitialState());

export function setAuth(user: AuthUser, token: string) {
  localStorage.setItem("auth", JSON.stringify({ user, token }));
  appStore.setState((s) => ({ ...s, user, token }));
}

export function clearAuth() {
  localStorage.removeItem("auth");
   localStorage.removeItem("token");
    localStorage.removeItem("user");

  appStore.setState((s) => ({ ...s, user: null, token: null }));
}

export function toggleTheme() {
  appStore.setState((s) => {
    const next = s.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    return { ...s, theme: next };
  });
}