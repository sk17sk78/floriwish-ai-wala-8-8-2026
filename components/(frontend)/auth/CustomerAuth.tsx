"use client";

import { memo } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import GoogleOnlyAuth from "./GoogleOnlyAuth";

function CustomerAuth() {
  const {
    auth: {
      data: { showAuth },
      method: { onChangeShowAuth },
    },
  } = useAppStates();

  return (
    <GoogleOnlyAuth
      openAuth={showAuth}
      setOpenAuth={(value) =>
        onChangeShowAuth(typeof value === "function" ? value(showAuth) : value)
      }
    />
  );
}

export default memo(CustomerAuth);
