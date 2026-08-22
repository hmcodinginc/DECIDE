import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RootLayout } from "@/components/layout/RootLayout";
import { LandingPage } from "@/pages/Landing/LandingPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";

async function lazyRoute(loader: () => Promise<{ Component: ComponentType }>) {
  try {
    return await loader();
  } catch (error) {
    const message = String(error);
    if (
      message.includes("Failed to fetch dynamically imported module") ||
      message.includes("error loading dynamically imported module")
    ) {
      window.location.reload();
    }
    throw error;
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: "app",
        lazy: () =>
          lazyRoute(async () => {
            const { AppHomePage } = await import("@/pages/App/AppHomePage");
            return { Component: AppHomePage };
          }),
      },
      {
        path: "app/new",
        lazy: () =>
          lazyRoute(async () => {
            const { NewDecisionPage } = await import(
              "@/pages/Decision/NewDecisionPage"
            );
            return {
              Component: function NewDecisionProtected() {
                return (
                  <ProtectedRoute>
                    <NewDecisionPage />
                  </ProtectedRoute>
                );
              },
            };
          }),
      },
      {
        path: "app/decision/:id",
        lazy: () =>
          lazyRoute(async () => {
            const { DecisionResultPage } = await import(
              "@/pages/Decision/DecisionResultPage"
            );
            return { Component: DecisionResultPage };
          }),
      },
      {
        path: "app/history",
        lazy: () =>
          lazyRoute(async () => {
            const { HistoryPage } = await import("@/pages/History/HistoryPage");
            return {
              Component: function HistoryProtected() {
                return (
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                );
              },
            };
          }),
      },
      {
        path: "pricing",
        lazy: () =>
          lazyRoute(async () => {
            const { PricingPage } = await import("@/pages/Pricing/PricingPage");
            return { Component: PricingPage };
          }),
      },
      {
        path: "login",
        lazy: () =>
          lazyRoute(async () => {
            const { LoginPage } = await import("@/pages/Auth/LoginPage");
            return { Component: LoginPage };
          }),
      },
      {
        path: "signup",
        lazy: () =>
          lazyRoute(async () => {
            const { SignupPage } = await import("@/pages/Auth/SignupPage");
            return { Component: SignupPage };
          }),
      },
      {
        path: "reset-password",
        lazy: () =>
          lazyRoute(async () => {
            const { ResetPasswordPage } = await import(
              "@/pages/Auth/ResetPasswordPage"
            );
            return { Component: ResetPasswordPage };
          }),
      },
      {
        path: "auth/callback",
        lazy: () =>
          lazyRoute(async () => {
            const { AuthCallbackPage } = await import(
              "@/pages/Auth/AuthCallbackPage"
            );
            return { Component: AuthCallbackPage };
          }),
      },
      {
        path: "settings",
        lazy: () =>
          lazyRoute(async () => {
            const { SettingsPage } = await import("@/pages/Settings/SettingsPage");
            return {
              Component: function SettingsProtected() {
                return (
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                );
              },
            };
          }),
      },
      {
        path: "billing",
        lazy: () =>
          lazyRoute(async () => {
            const { BillingPage } = await import("@/pages/Billing/BillingPage");
            return {
              Component: function BillingProtected() {
                return (
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                );
              },
            };
          }),
      },
      {
        path: "billing/return",
        lazy: () =>
          lazyRoute(async () => {
            const { BillingReturnPage } = await import(
              "@/pages/Billing/BillingReturnPage"
            );
            return {
              Component: function BillingReturnProtected() {
                return (
                  <ProtectedRoute>
                    <BillingReturnPage />
                  </ProtectedRoute>
                );
              },
            };
          }),
      },
      {
        path: "terms",
        lazy: () =>
          lazyRoute(async () => {
            const { TermsPage } = await import("@/pages/Legal/TermsPage");
            return { Component: TermsPage };
          }),
      },
      {
        path: "privacy",
        lazy: () =>
          lazyRoute(async () => {
            const { PrivacyPage } = await import("@/pages/Legal/PrivacyPage");
            return { Component: PrivacyPage };
          }),
      },
      {
        path: "about",
        lazy: () =>
          lazyRoute(async () => {
            const { AboutPage } = await import("@/pages/Legal/AboutPage");
            return { Component: AboutPage };
          }),
      },
      {
        path: "contact",
        lazy: () =>
          lazyRoute(async () => {
            const { ContactPage } = await import("@/pages/Legal/ContactPage");
            return { Component: ContactPage };
          }),
      },
      {
        path: "*",
        lazy: () =>
          lazyRoute(async () => {
            const { NotFoundPage } = await import("@/pages/NotFoundPage");
            return { Component: NotFoundPage };
          }),
      },
    ],
  },
]);
