import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserName from "./components/UserName";
import Password from "./components/Password";
import Reset from "./components/Reset";
import PageNotFound from "./components/PageNotFound";
import Profile from "./components/Profile";
import Recovery from "./components/Recovery";
import Register from "./components/Register";

/** auth middleware */
import { AuthorizeUser, ProtectRoute } from './middleware/auth'

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserName></UserName>,
  },
  {
    path: "/register",
    element: <Register></Register>,
  },
  {
    path: "/password",
    element: <ProtectRoute><Password /></ProtectRoute>,
  },
  {
    path: "/reset",
    element: <ProtectRoute><Reset /></ProtectRoute>,
  },
  {
    path: "/profile",
    element: <AuthorizeUser><Profile /></AuthorizeUser>,
  },
  {
    path: "/recovery",
    element: <ProtectRoute><Recovery /></ProtectRoute>,
  },
  {
    path: "*",
    element: <PageNotFound></PageNotFound>,
  },
]);

export default function App() {
  return (
    <main>
      <RouterProvider router={router}></RouterProvider>
    </main>
  );
}
