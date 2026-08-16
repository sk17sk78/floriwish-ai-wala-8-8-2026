"use client";

// redux
import { store } from "@/store/store";

// providers
import { Provider } from "react-redux";
import { AdminThemeProvider } from "@/hooks/useAdminTheme";

// hooks
import { useAdminAuth } from "@/hooks/auth/useAdminAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// layouts
import AdminSidebar from "@/layouts/admin/sidebar/AdminSidebar";
import { AdminThemeToggle } from "@/components/(admin)/theme/AdminThemeToggle";

// types
import { type Children } from "@/common/types/reactTypes";
import { ROOT_ADMIN_ROUTE } from "@/common/routes/admin/staticLinks";

export default function AdminRoot({ children }: { children: Children }) {
  // hooks
  const { replace } = useRouter();

  const {
    status,
    data: { isAuthenticated },
    method: { validate }
  } = useAdminAuth();

  // effects
  useEffect(() => {
    if (status === "initial") {
      validate();
    }
  }, [status, validate]);

  useEffect(() => {
    if (status !== "initial" && !isAuthenticated) {
      replace(`${ROOT_ADMIN_ROUTE}/login`);
    }
  }, [status, isAuthenticated, replace]);

  // return
  if (status === "initial" || !isAuthenticated) {
    return (
      <div className="h-device w-device flex items-center justify-center text-charcoal-3/70 text-3xl bg-[#fafafc] dark:bg-[#0d0d0f]">
        Loading
      </div>
    );
  }

  return (
    <Provider store={store}>
      <AdminThemeProvider>
        <div className="h-device w-device grid grid-cols-1 sm:grid-cols-[auto_1fr] overflow-y-hidden overflow-x-hidden transition-colors duration-200">
          <AdminSidebar />
          <main className="sm:px-6 sm:py-6 relative h-screen max-h-screen overflow-y-auto overflow-x-auto scrollbar-thin transition-colors duration-200">
            {/* Top Right Floating Quick Theme Toggle */}
            <div className="fixed top-4 right-5 z-40 hidden sm:block">
              <AdminThemeToggle variant="pill" />
            </div>

            {children}
          </main>
        </div>
      </AdminThemeProvider>
    </Provider>
  );
}
