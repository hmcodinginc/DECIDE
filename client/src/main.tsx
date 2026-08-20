import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from "@/hooks/useAuth";
import { router } from "@/routes";
import "@/index.css";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element missing.");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
