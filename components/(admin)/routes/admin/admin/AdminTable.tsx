"use client";

// hooks
import { useState } from "react";
import { useAdminAuth } from "@/hooks/auth/useAdminAuth";
import { getPermission } from "@/common/utils/admin/permission";

// redux
import {
  createAdminAction,
  selectAdmin
} from "@/store/features/users/adminSlice";

// layouts
import AdminTableLayout from "@/layouts/admin/table/AdminTableLayout";

// utils
import getDocumentsFromFormFieldsGenerator from "./utils/getDocumentsFromFormFieldsGenerator";
import getTableContentGenerator from "./utils/getTableContentGenerator";
import GetTableFilterKeywordOptions from "./utils/GetTableFilterKeywordOptions";

// components
import TableFormFields from "./components/TableFormFields";

// types
import { type AdminDocument } from "@/common/types/documentation/users/admin";
import { type FilterKeywordOptions } from "@/common/types/redux/filterOption";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";

export default function AdminTable() {
  const {
    data: { userName, isSuperAdmin, permission: rolePermission }
  } = useAdminAuth();

  const permission = getPermission({
    isSuperAdmin,
    permission: rolePermission,
    sectionKey: "staff",
    subSectionKey: "admin"
  });

  const [filterKeywordOptions, setFilterKeywordOptions] = useState<
    FilterKeywordOptions<AdminDocument>
  >({});

  return (
    <>
      <GetTableFilterKeywordOptions onReturnOptions={setFilterKeywordOptions} />
      <AdminTableLayout
        userName={userName}
        isSuperAdmin={isSuperAdmin}
        permission={permission}
        collectionName="Admins"
        documentName="Admin"
        createAction={createAdminAction}
        select={selectAdmin}
        filterKeywordOptions={filterKeywordOptions}
        getContent={getTableContentGenerator({ permission, isSuperAdmin })}
        getFormFields={({ initialDocument, isSuperAdmin }) => (
          <TableFormFields initialDocument={initialDocument} isSuperAdmin={isSuperAdmin} />
        )}
        getDocumentsFromFormFields={getDocumentsFromFormFieldsGenerator()}
      />
    </>
  );
}
