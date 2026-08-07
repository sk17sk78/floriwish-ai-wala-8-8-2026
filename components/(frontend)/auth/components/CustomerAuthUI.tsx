// constants
import { GOOGLE_CLIENT_ID } from "@/common/constants/environmentVariables";

// utils
import { memo } from "react";

// providers
import { CustomerAuthProvider } from "@/hooks/auth/useCustomerAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SettingProvider } from "@/hooks/useSetting/useSetting";

// components
import CustomerAuthAuthentication from "./CustomerAuthAuthentication";
import CustomerAuthIdentification from "./CustomerAuthIdentification";
import NewCustomerAuthWrapper from "./NewCustomerAuthWrapper";
import { COMPANY_NAME } from "@/common/constants/companyDetails";

function CustomerAuthUI() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SettingProvider>
        <CustomerAuthProvider>
          <div className="flex flex-col items-start justify-center w-device px-4 my-10 sm:w-[500px] z-[10000]">
            <span className="font-medium  text-2xl text-sienna">
              Welcome to {COMPANY_NAME}
            </span>
            <span className="font-medium text-base text-charcoal-3 pt-1.5">
              Signin to continue
            </span>
          </div>
          <NewCustomerAuthWrapper>
            <CustomerAuthIdentification />
            <CustomerAuthAuthentication />
          </NewCustomerAuthWrapper>
        </CustomerAuthProvider>
      </SettingProvider>
    </GoogleOAuthProvider>
  );
}

export default memo(CustomerAuthUI);
