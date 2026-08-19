"use client";

// utils
import { memo } from "react";

// components
import GoogleOnlyAuth from "../GoogleOnlyAuth";

function CustomerAuthDialog({
  showDialog,
  onChangeShowDialog
}: {
  showDialog: boolean;
  onChangeShowDialog: (showDialog: boolean) => void;
}) {
  return (
    <GoogleOnlyAuth
      openAuth={showDialog}
      setOpenAuth={(value) =>
        onChangeShowDialog(
          typeof value === "function" ? value(showDialog) : value
        )
      }
    />
  );
}

export default memo(CustomerAuthDialog);
