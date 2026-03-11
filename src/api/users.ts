import { appStore } from "@/store/appStore";

const BASE = "https://dummyjson.com";

function getHeaders(): HeadersInit {
  const token = appStore.state.token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginApi(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Invalid credentials");
  }
  return res.json();
}

// function getHeaders(): HeadersInit {
//   const token = appStore.state.token;
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
// 

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  age: number;
  image: string;
  company: { name: string };
}

export async function getUsers(): Promise<{ users: User[]; total: number }> {
  const res = await fetch(`${BASE}/users?limit=208`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${BASE}/users/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  age: number;
}

export async function addUser(data: UserPayload): Promise<User> {
  const res = await fetch(`${BASE}/users/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create user");
  }
  return res.json();
}

export async function updateUser(id: number, data: Partial<UserPayload>): Promise<User> {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update user");
  }
  return res.json();
}

export async function deleteUser(id: number): Promise<{ id: number; isDeleted: boolean }> {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}
