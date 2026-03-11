import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useRouterState, Link } from "@tanstack/react-router";
import { appStore } from "@/store/appStore";
import { useState } from "react";

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

export function EditUserPage() {
  const { id } = useParams({ from: "/app/users/$id/edit" });
  const userId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const routeUser = (routerState.location.state as any)?.user;
  const { data: fetchedUser, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`https://dummyjson.com/users/${userId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !routeUser,
  });

  const user = routeUser || fetchedUser;
  const mutation = useMutation({
    mutationFn: async (data: Partial<UserPayload>) => {
      const res = await fetch(`https://dummyjson.com/users/${userId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/app/users" }), 1200);
    },
    onError: (err: any) => {
      setServerError(err.message || "Failed to update user");
    },
  });

  if (!user && isLoading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading user…</div>;
  }

  if (!user) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--danger)" }}>User not found.</div>;
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="page-header">
        <h1 className="page-title">Edit User #{userId}</h1>
        <Link to="/app/users">
          <button className="btn btn-ghost">← Back to Users</button>
        </Link>
      </div>

      {success && (
        <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", color: "#166534", marginBottom: "1rem", fontSize: "0.875rem" }}>
          User updated! Redirecting…
        </div>
      )}

      <div className="card">
        <UserEditForm
          defaultValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            username: user.username,
            age: user.age,
          }}
          isPending={mutation.isPending}
          serverError={serverError}
          onSubmit={(value) => {
            setServerError("");
            mutation.mutate(value);
          }}
        />
      </div>
    </div>
  );
}

function UserEditForm({
  defaultValues,
  onSubmit,
  isPending,
  serverError,
}: {
  defaultValues: UserPayload;
  onSubmit: (v: UserPayload) => void;
  isPending: boolean;
  serverError: string;
}) {
  const navigate = useNavigate();

  const form = useForm<UserPayload>({
    defaultValues,
    onSubmit: async ({ value }) => onSubmit(value),
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
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
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
                        f.type === "number" ? Number(e.target.value) : (e.target.value as any)
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
        <button type="button" className="btn btn-ghost" onClick={() => navigate({ to: "/app/users" })}>
          Cancel
        </button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}





// import { useForm } from "@tanstack/react-form";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useNavigate, useParams, useRouterState, Link } from "@tanstack/react-router";
// import { appStore } from "@/store/appStore";
// import { useState } from "react";

// interface UserPayload {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   username: string;
//   age: number;
// }

// interface User extends UserPayload {
//   id: number;
// }

// function getHeaders(): HeadersInit {
//   const token = appStore.state.token;
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

// // // ─── FIELDS definition ────────────────────────────────────────────────────────
// const FIELDS: Array<{
//   name: keyof UserPayload;
//   label: string;
//   type?: string;
//   placeholder: string;
// }> = [
//   { name: "firstName", label: "First Name", placeholder: "John" },
//   { name: "lastName",  label: "Last Name",  placeholder: "Doe" },
//   { name: "email",     label: "Email",      type: "email", placeholder: "john@example.com" },
//   { name: "phone",     label: "Phone",      placeholder: "+1 555-0000" },
//   { name: "username",  label: "Username",   placeholder: "johndoe" },
//   { name: "age",       label: "Age",        type: "number", placeholder: "25" },
// ];

// // ─── NEW: Inline Edit Row ─────────────────────────────────────────────────────
// export function InlineEditRow({
//   user,
//   onSave,
//   onCancel,
//   //onChange,
//   isPending,
// }: {
//   user: User;
//   onSave: (v: UserPayload) => void;
//   onCancel: () => void;
//  // onChange: (v: Partial<UserPayload>) => void;
//   isPending: boolean;
// }) {
//   const form = useForm<UserPayload>({
//     defaultValues: {
//       firstName: user.firstName,
//       lastName:  user.lastName,
//       email:     user.email,
//       phone:     user.phone,
//       username:  user.username,
//       age:       user.age,
//     },
//     onSubmit: async ({ value }) => onSave(value),
//   });

//   return (
//     <tr style={{ background: "#fefce8", verticalAlign: "top" }}>
//       {/* avatar placeholder to match avatar column */}
//       <td style={{ padding: "0.4rem 0.5rem" }} />

//       {FIELDS.map((f) => (
//         <td key={f.name} style={{ padding: "0.4rem 0.5rem" }}>
//           <form.Field
//             name={f.name}
//             validators={{
//               onBlur: ({ value }) => {
//                 if (!value && value !== 0) return `${f.label} is required`;
//                 if (f.type === "email" && !/\S+@\S+\.\S+/.test(String(value)))
//                   return "Enter a valid email";
//                 if (f.name === "age" && (Number(value) < 1 || Number(value) > 120))
//                   return "Age must be between 1 and 120";
//                 return undefined;
//               },
//             }}
//           >
//             {(field) => (
//               <div>
//                 <input
//                   type={f.type || "text"}
//                   placeholder={f.placeholder}
//                   value={field.state.value as string}
//                   onChange={(e) =>
//                     field.handleChange(
//                       f.type === "number"
//                         ? (Number(e.target.value) as any)
//                         : (e.target.value as any)
//                     )
//                   }
//                   onBlur={field.handleBlur}
//                   style={{
//                     width: "100%",
//                     padding: "0.3rem 0.45rem",
//                     fontSize: "0.8rem",
//                     border: `1px solid ${field.state.meta.errors.length > 0 ? "#ef4444" : "#cbd5e1"}`,
//                     borderRadius: "5px",
//                     outline: "none",
//                     boxSizing: "border-box" as const,
//                     background: "#fff",
//                   }}
//                 />
//                 {field.state.meta.errors.length > 0 && (
//                   <span style={{ fontSize: "0.68rem", color: "#ef4444", display: "block", marginTop: "2px" }}>
//                     {field.state.meta.errors[0]}
//                   </span>
//                 )}
//               </div>
//             )}
//           </form.Field>
//         </td>
//       ))}

//       {/* company column placeholder */}
//       <td style={{ padding: "0.4rem 0.5rem" }} />

//       {/* Save / Cancel */}
//       <td style={{ padding: "0.4rem 0.5rem", whiteSpace: "nowrap" }}>
//         <form.Subscribe selector={(s) => s.isSubmitting}>
//           {(isSubmitting) => (
//             <button
//               onClick={() => form.handleSubmit()}
//               disabled={isSubmitting || isPending}
//               className="btn btn-primary"
//               style={{ marginRight: "0.35rem", fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
//             >
//               {isPending ? "Saving…" : "✓ Save"}
//             </button>
//           )}
//         </form.Subscribe>
//         <button
//           onClick={onCancel}
//           className="btn btn-ghost"
//           style={{ fontSize: "0.78rem", padding: "0.3rem 0.55rem" }}
//         >
//           ✕
//         </button>
//       </td>
//     </tr>
//   );
// }
// // ─────────────────────────────────────────────────────────────────────────────

// export function EditUserPage() {
//   const { id } = useParams({ from: "/app/users/$id/edit" });
//   const userId = Number(id);
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const routerState = useRouterState();
//   const [serverError, setServerError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const routeUser = (routerState.location.state as any)?.user;
//   const { data: fetchedUser, isLoading } = useQuery({
//     queryKey: ["user", userId],
//     queryFn: async () => {
//       const res = await fetch(`https://dummyjson.com/users/${userId}`, {
//         headers: getHeaders(),
//       });
//       if (!res.ok) throw new Error("Failed to fetch user");
//       return res.json();
//     },
//     enabled: !routeUser,
//   });

//   const user = routeUser || fetchedUser;
//   const mutation = useMutation({
//     mutationFn: async (data: Partial<UserPayload>) => {
//       const res = await fetch(`https://dummyjson.com/users/${userId}`, {
//         method: "PUT",
//         headers: getHeaders(),
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Failed to update user");
//       }
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       queryClient.invalidateQueries({ queryKey: ["user", userId] });
//       setSuccess(true);
//       setTimeout(() => navigate({ to: "/app/users" }), 1200);
//     },
//     onError: (err: any) => {
//       setServerError(err.message || "Failed to update user");
//     },
//   });

//   if (!user && isLoading) {
//     return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading user…</div>;
//   }

//   if (!user) {
//     return <div style={{ padding: "3rem", textAlign: "center", color: "var(--danger)" }}>User not found.</div>;
//   }

//   return (
//     <div style={{ maxWidth: "600px" }}>
//       <div className="page-header">
//         <h1 className="page-title">Edit User #{userId}</h1>
//         <Link to="/app/users">
//           <button className="btn btn-ghost">← Back to Users</button>
//         </Link>
//       </div>

//       {success && (
//         <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", color: "#166534", marginBottom: "1rem", fontSize: "0.875rem" }}>
//           User updated! Redirecting…
//         </div>
//       )}

//       <div className="card">
//         <UserEditForm
//           defaultValues={{
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             phone: user.phone,
//             username: user.username,
//             age: user.age,
//           }}
//           isPending={mutation.isPending}
//           serverError={serverError}
//           onSubmit={(value) => {
//             setServerError("");
//             mutation.mutate(value);
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// function UserEditForm({
//   defaultValues,
//   onSubmit,
//   isPending,
//   serverError,
// }: {
//   defaultValues: UserPayload;
//   onSubmit: (v: UserPayload) => void;
//   isPending: boolean;
//   serverError: string;
// }) {
//   const navigate = useNavigate();

//   const form = useForm<UserPayload>({
//     defaultValues,
//     onSubmit: async ({ value }) => onSubmit(value),
//   });

//   const fields: Array<{ name: keyof UserPayload; label: string; type?: string; placeholder: string }> = [
//     { name: "firstName", label: "First Name", placeholder: "John" },
//     { name: "lastName", label: "Last Name", placeholder: "Doe" },
//     { name: "email", label: "Email", type: "email", placeholder: "john@example.com" },
//     { name: "phone", label: "Phone", placeholder: "+1 555-0000" },
//     { name: "username", label: "Username", placeholder: "johndoe" },
//     { name: "age", label: "Age", type: "number", placeholder: "25" },
//   ];

//   return (
//     <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//         {fields.map((f) => (
//           <div key={f.name} style={f.name === "email" ? { gridColumn: "1 / -1" } : {}}>
//             <form.Field
//               name={f.name}
              
//               validators={{
//                 onBlur: ({ value }) => {
//                   if (!value && value !== 0) return `${f.label} is required`;
//                   if (f.type === "email" && !/\S+@\S+\.\S+/.test(String(value)))
//                     return "Enter a valid email";
//                   if (f.name === "age" && (Number(value) < 1 || Number(value) > 120))
//                     return "Age must be between 1 and 120";
//                   return undefined;
//                 },
//               }}
//             >
//               {(field) => (
//                 <>
//                   <label>{f.label}</label>
//                   <input
//                     type={f.type || "text"}
//                     placeholder={f.placeholder}
//                     value={field.state.value as string}
//                     onChange={(e) =>
//                       field.handleChange(
//                         f.type === "number" ? Number(e.target.value) : (e.target.value as any)
//                       )
//                     }
//                     onBlur={field.handleBlur}
//                   />
//                   {field.state.meta.errors.length > 0 && (
//                     <p className="field-error">{field.state.meta.errors[0]}</p>
//                   )}
//                 </>
//               )}
//             </form.Field>
//           </div>
//         ))}
//       </div>

//       {serverError && (
//         <p className="field-error" style={{ background: "var(--danger-muted)", padding: "0.6rem 0.75rem", borderRadius: "6px", marginTop: "1rem" }}>
//           ⚠️ {serverError}
//         </p>
//       )}

//       <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
//         <button type="button" className="btn btn-ghost" onClick={() => navigate({ to: "/app/users" })}>
//           Cancel
//         </button>
//         <form.Subscribe selector={(s) => s.isSubmitting}>
//           {(isSubmitting) => (
//             <button type="submit" className="btn btn-primary" disabled={isSubmitting || isPending}>
//               {isPending ? "Saving…" : "Save Changes"}
//             </button>
//           )}
//         </form.Subscribe>
//       </div>
//     </form>
//   );
// }