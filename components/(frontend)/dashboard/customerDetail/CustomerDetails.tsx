"use client";

// constants

// utils
import { lazy } from "react";

// hooks
import { useState } from "react";

// components
import CustomerDetail from "./components/CustomerDetail";
const CustomerDetailForm = lazy(
  () => import("./components/CustomerDetailForm")
);
import CustomerDetailWrapper from "./components/CustomerDetailWrapper";
import { Suspense } from "react";

export default function CustomerDetails() {
  // states
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <>
      <CustomerDetailWrapper>
        {showForm ? (
          <Suspense>
            <CustomerDetailForm
              onCloseForm={() => {
                setShowForm(false);
              }}
            />
          </Suspense>
        ) : (
          <CustomerDetail
            onShowForm={() => {
              setShowForm(true);
            }}
          />
        )}
      </CustomerDetailWrapper>
    </>
  );
}
