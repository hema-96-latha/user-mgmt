import {
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { appStore } from "@/store/appStore";

import { LoginPage } from "@/routes/_public/LoginPage";
import { AppLayout } from "@/routes/_protected/AppLayout";
import { UsersPage } from "@/routes/users/UsersPage";
import { NewUserPage } from "@/routes/users/NewUserPage";
import { EditUserPage } from "@/routes/users/EditUserPage";
import { ProfilePage } from "@/routes/_protected/ProfilePage";


const rootRoute = createRootRoute({ component: Outlet });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: () => {
    if (appStore.state.token) throw redirect({ to: "/app/users" });
  },
});


const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AppLayout,
  beforeLoad: () => {
    if (!appStore.state.token) throw redirect({ to: "/login" });
  },
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users",
  component: UsersPage,
//  validateSearch: (search: Record<string, unknown>) => ({
//  name: (search.name as string) ?? "",
//     email: (search.email as string) ?? "",
//   }),
});

const newUserRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users/new",
  component: NewUserPage,
});

const editUserRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users/$id/edit",
  component: EditUserPage,
});

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: ProfilePage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: appStore.state.token ? "/app/users" : "/login" });
  },
});


export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    usersRoute,
    newUserRoute,
    editUserRoute,
    profileRoute,
  ]),
]);
