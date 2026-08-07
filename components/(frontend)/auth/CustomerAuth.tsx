// utils
import { memo, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
const GoogleOnlyAuth = dynamic(() => import("./GoogleOnlyAuth"), {
  ssr: false,
});

function CustomerAuth() {
  const {
    auth: {
      data: { showAuth },
      method: { onChangeShowAuth },
    },
  } = useAppStates();

  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (showAuth) setHasOpened(true);
  }, [showAuth]);

  if (!hasOpened) return null;

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
