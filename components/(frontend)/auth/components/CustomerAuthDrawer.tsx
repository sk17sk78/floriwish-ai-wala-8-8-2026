"use client";

// utils
import { memo } from "react";

// components
import GoogleOnlyAuth from "../GoogleOnlyAuth";

function CustomerAuthDrawer({
  showDrawer,
  onChangeShowDrawer
}: {
  showDrawer: boolean;
  onChangeShowDrawer: (showDrawer: boolean) => void;
}) {
  return (
    <GoogleOnlyAuth
      openAuth={showDrawer}
      setOpenAuth={(value) =>
        onChangeShowDrawer(
          typeof value === "function" ? value(showDrawer) : value
        )
      }
    />
  );
}

export default memo(CustomerAuthDrawer);
