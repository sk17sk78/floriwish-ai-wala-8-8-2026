"use client";

// constants
import { GOOGLE_CLIENT_ID } from "@/common/constants/environmentVariables";

// hooks
import { CustomerAuthProvider } from "@/hooks/auth/useCustomerAuth";
import { CartProvider } from "@/hooks/useCart";
import { CustomerProfileProvider } from "@/hooks/useCustomerProfile";
import { LocationProvider } from "@/hooks/useLocation/useLocation";
import { SearchProvider } from "@/hooks/useSearch/useSearch";
import { SettingProvider } from "@/hooks/useSetting/useSetting";
import { GoogleOAuthProvider } from "@react-oauth/google";

// components
import CacheInitializer from "@/components/CacheInitializer";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotificationPrompt from "@/components/(frontend)/notifications/NotificationPrompt";

// types
import { type ReactNode } from "react";

export default function ContextProvider({
  children
}: {
  children: ReactNode;
}) {
  return (
    <ErrorBoundary>
      <SettingProvider>
        <GoogleOAuthProvider clientId={String(GOOGLE_CLIENT_ID)}>
          <CustomerAuthProvider>
            <CustomerProfileProvider>
              <LocationProvider>
                <SearchProvider>
                  <ErrorBoundary>
                    <CartProvider>
                      <CacheInitializer />
                      {children}
                      <NotificationPrompt />
                    </CartProvider>
                  </ErrorBoundary>
                </SearchProvider>
              </LocationProvider>
            </CustomerProfileProvider>
          </CustomerAuthProvider>
        </GoogleOAuthProvider>
      </SettingProvider>
    </ErrorBoundary>
  );
}
