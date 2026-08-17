import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RootLayout } from "@/components/layout/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: async () => {
          const { LandingPage } = await import("@/pages/Landing/LandingPage");
          return { Component: LandingPage };
        },
      },
      {
        path: "app",
        lazy: async () => {
          const { AppHomePage } = await import("@/pages/App/AppHomePage");
          return { Component: AppHomePage };
        },
      },
      {
        path: "app/new",
        lazy: async () => {
          const { NewDecisionPage } = await import("@/pages/Decision/NewDecisionPage");
          return { Component: NewDecisionPage };
        },
      },
      {
        path: "app/decision/:id",
        lazy: async () => {
          const { DecisionResultPage } = await import(
            "@/pages/Decision/DecisionResultPage"
          );
          return { Component: DecisionResultPage };
        },
      },
      {
        path: "app/history",
        lazy: async () => {
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
        },
      },
      {
        path: "pricing",
        lazy: async () => {
          const { PricingPage } = await import("@/pages/Pricing/PricingPage");
          return { Component: PricingPage };
        },
      },
      {
        path: "login",
        lazy: async () => {
          const { LoginPage } = await import("@/pages/Auth/LoginPage");
          return { Component: LoginPage };
        },
      },
      {
        path: "signup",
        lazy: async () => {
          const { SignupPage } = await import("@/pages/Auth/SignupPage");
          return { Component: SignupPage };
        },
      },
      {
        path: "reset-password",
        lazy: async () => {
          const { ResetPasswordPage } = await import("@/pages/Auth/ResetPasswordPage");
          return { Component: ResetPasswordPage };
        },
      },
      {
        path: "auth/callback",
        lazy: async () => {
          const { AuthCallbackPage } = await import("@/pages/Auth/AuthCallbackPage");
          return { Component: AuthCallbackPage };
        },
      },
      {
        path: "settings",
        lazy: async () => {
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
        },
      },
      {
        path: "billing",
        lazy: async () => {
          const { BillingPage } = await import("@/pages/Billing/BillingPage");
          return { Component: BillingPage };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundPage } = await import("@/pages/NotFoundPage");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
