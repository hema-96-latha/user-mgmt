
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { appStore } from "@/store/appStore";

interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  age: number;
}

function getHeaders(): HeadersInit {
  const token = appStore.state.token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function addUser(data: UserPayload) {
  const res = await fetch("https://dummyjson.com/users/add", {
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

export function NewUserPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/app/users" }), 1200);
    },
    onError: (err: any) => {
      setServerError(err.message || "Failed to create user");
    },
  });

  const form = useForm<UserPayload>({
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", username: "", age: 18 },
    onSubmit: async ({ value }) => {
      setServerError("");
      mutation.mutate(value);
    },
  });

  const fields: Array<{ name: keyof UserPayload; label: string; type?: string; placeholder: string }> = [
    { name: "firstName", label: "First Name", placeholder: "John" },
    { name: "lastName", label: "Last Name", placeholder: "Doe" },
    { name: "email", label: "Email", type: "email", placeholder: "john@example.com" },
    { name: "phone", label: "Phone", placeholder: "+1 555-0000" },
    { name: "username", label: "Username", placeholder: "johndoe" },
    { name: "age", label: "Age", type: "number", placeholder: "25" },
  ];

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="page-header">
        <h1 className="page-title">New User</h1>
        <Link to="/app/users">
          <button className="btn btn-ghost">← Back to Users</button>
        </Link>
      </div>

      {success && (
        <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", color: "#166534", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ✅ User created! Redirecting…
        </div>
      )}

      <div className="card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {fields.map((f) => (
              <div key={f.name} style={f.name === "email" ? { gridColumn: "1 / -1" } : {}}>
                <form.Field
                  name={f.name}
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value && value !== 0) return `${f.label} is required`;
                      if (f.type === "email" && !/\S+@\S+\.\S+/.test(String(value)))
                        return "Enter a valid email";
                      if (f.name === "age" && (Number(value) < 1 || Number(value) > 120))
                        return "Age must be between 1 and 120";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <>
                      <label>{f.label}</label>
                      <input
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={field.state.value as string}
                        onChange={(e) =>
                          field.handleChange(
                            f.type === "number" ? Number(e.target.value) : e.target.value as any
                          )
                        }
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="field-error">{field.state.meta.errors[0]}</p>
                      )}
                    </>
                  )}
                </form.Field>
              </div>
            ))}
          </div>

          {serverError && (
            <p className="field-error" style={{ background: "var(--danger-muted)", padding: "0.6rem 0.75rem", borderRadius: "6px", marginTop: "1rem" }}>
              ⚠️ {serverError}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <Link to="/app/users">
              <button type="button" className="btn btn-ghost">Cancel</button>
            </Link>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
                  {mutation.isPending ? "Creating…" : "Create User"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}
