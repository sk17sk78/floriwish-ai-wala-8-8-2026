// redux
import {
  createAdminRoleAction,
  selectAdminRole
} from "@/store/features/presets/adminRoleSlice";

// hooks
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "@/store/withType";

// components
import Input from "@/lib/Forms/Input/Input";

// types
import { type AdminDocument } from "@/common/types/documentation/users/admin";

export default function TableFormFields({
  initialDocument,
  isSuperAdmin
}: {
  initialDocument?: AdminDocument;
  isSuperAdmin?: boolean;
}) {
  // hooks
  const dispatch = useDispatch();

  // redux
  const adminRoleStatus = useSelector(selectAdminRole.status);

  const { options: adminRoleOptions } = useSelector((state) =>
    selectAdminRole.documentList(state, {
      active: true,
      sortBy: "label",
      orderBy: "asc"
    })
  );

  // states
  const [adminIsSuperAdmin, setAdminIsSuperAdmin] = useState<boolean>(
    initialDocument?.isSuperAdmin || false
  );

  // effects
  useEffect(() => {
    if (adminRoleStatus === "idle") {
      dispatch(createAdminRoleAction.fetchDocumentList());
    }
  }, [adminRoleStatus, dispatch]);

  useEffect(() => {
    if (initialDocument) {
      setAdminIsSuperAdmin(initialDocument.isSuperAdmin);
    }
  }, [initialDocument]);

  return (
    <>
      <Input
        type="text"
        name="userName"
        isRequired
        labelConfig={{
          label: "Username",
          layoutStyle: ""
        }}
        defaultValue={initialDocument?.userName}
        errorCheck={false}
        validCheck={false}
      />
      <Input
        type="password"
        name="password"
        isRequired={!initialDocument}
        labelConfig={{
          label: "Password",
          layoutStyle: ""
        }}
        defaultValue={initialDocument?.password}
        errorCheck={false}
        validCheck={false}
      />
      {isSuperAdmin && (
        <div className="flex items-center justify-start gap-5 py-1">
          <span className="font-medium">Is Super Admin?</span>
          <input
            type="checkbox"
            name="isSuperAdmin"
            className="accent-rose-500 w-5 h-5 cursor-pointer"
            checked={adminIsSuperAdmin}
            onChange={(e) => setAdminIsSuperAdmin(e.target.checked)}
          />
        </div>
      )}
      {!adminIsSuperAdmin && (
        <Input
          type="dropdown"
          name="role"
          isRequired
          labelConfig={{
            label: "Role"
          }}
          errorCheck={false}
          validCheck={false}
          nullOption
          customInitialValuePlaceholderLabel="None"
          defaultValue={
            typeof initialDocument?.role === "string"
              ? initialDocument.role
              : (initialDocument?.role as any)?._id || ""
          }
          options={adminRoleOptions}
        />
      )}
    </>
  );
}
