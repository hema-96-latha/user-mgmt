
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "@/api/users";
import { setAuth } from "@/store/appStore";

export function LoginPage() {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      loginApi(username, password),
    onSuccess: (data) => {
      setAuth(
        {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          image: data.image,
          token: data?.accessToken,
        },
        data?.accessToken
      );
      navigate({ to: "/app/users" });
    },
  });

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      loginMutation.mutate({ username: value.username, password: value.password });
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "1rem",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🧑‍💼</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            User Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <form.Field
              name="username"
              validators={{
                onBlur: ({ value }) =>
                  !value.trim() ? "Username is required" : undefined,
              }}
            >
              {(field) => (
                <>
                  <label htmlFor="username">Username</label>
                  <input
                    name="username"
                    placeholder="e.g. emilys"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="username"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="field-error">{field.state.meta.errors[0]}</p>
                  )}
                </>
              )}
            </form.Field>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Password is required" : undefined,
              }}
            >
              {(field) => (
                <>
                  <label htmlFor="password">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="current-password"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="field-error">{field.state.meta.errors[0]}</p>
                  )}
                </>
              )}
            </form.Field>
          </div>

          {loginMutation.isError && (
            <p
              className="field-error"
              style={{
                background: "var(--danger-muted)",
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontSize: "0.85rem",
              }}
            >
              ⚠️ {(loginMutation.error as any)?.message || "Login failed"}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loginMutation.isPending}
            style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}