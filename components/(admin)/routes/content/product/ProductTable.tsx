"use client";

// hooks
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "@/store/withType";
import { useAdminAuth } from "@/hooks/auth/useAdminAuth";
import { getPermission } from "@/common/utils/admin/permission";

// redux
import {
  createImageAction,
  selectImage
} from "@/store/features/media/imageSlice";
import {
  createContentAction,
  selectContent
} from "@/store/features/contents/contentSlice";
import {
  createContentCategoryAction,
  selectContentCategory
} from "@/store/features/categories/contentCategorySlice";

// layouts
import AdminTableLayout from "@/layouts/admin/table/AdminTableLayout";

// utils
import getDocumentsFromFormFieldsGenerator from "./utils/getDocumentsFromFormFieldsGenerator";
import getTableContentGenerator from "./utils/getTableContentGenerator";
import GetTableFilterKeywordOptions from "./utils/GetTableFilterKeywordOptions";

// components
import ContentTableFormFields from "../content/ContentTableFormFields";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type FilterKeywordOptions } from "@/common/types/redux/filterOption";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";

export default function ProductTable() {
  const {
    data: { userName, isSuperAdmin, permission: rolePermission }
  } = useAdminAuth();

  const permission = getPermission({
    isSuperAdmin,
    permission: rolePermission,
    sectionKey: "product",
    subSectionKey: "products"
  });

  const dispatch = useDispatch();

  const contentCategoryStatus = useSelector(selectContentCategory.status);

  const { documents: contentCategories } = useSelector((state) =>
    selectContentCategory.documentList(state, {
      active: true
    })
  );

  const imageStatus = useSelector(selectImage.status);

  const { documents: images } = useSelector((state) =>
    selectImage.documentList(state, {
      deleted: false
    })
  );

  const [filterKeywordOptions, setFilterKeywordOptions] = useState<
    FilterKeywordOptions<ContentDocument>
  >({});

  useEffect(() => {
    if (contentCategoryStatus === "idle") {
      dispatch(createContentCategoryAction.fetchDocumentList());
    }
  }, [contentCategoryStatus, dispatch]);

  useEffect(() => {
    if (imageStatus === "idle") {
      dispatch(createImageAction.fetchDocumentList());
    }
  }, [imageStatus, dispatch]);

  return (
    <>
      <GetTableFilterKeywordOptions onReturnOptions={setFilterKeywordOptions} />
      <AdminTableLayout
        userName={userName}
        isSuperAdmin={isSuperAdmin}
        permission={permission}
        collectionName="Products"
        documentName="Product"
        createAction={createContentAction}
        select={selectContent}
        defaultFilterBy="type"
        defaultFilterKeyword="product"
        filterKeywordOptions={filterKeywordOptions}
        getContent={getTableContentGenerator({
          permission,
          isSuperAdmin,
          contentCategories,
          images
        })}
        getFormFields={({ initialDocument, isSuperAdmin }) => (
          <ContentTableFormFields initialDocument={initialDocument} isSuperAdmin={isSuperAdmin} />
        )}
        getDocumentsFromFormFields={getDocumentsFromFormFieldsGenerator()}
      />
    </>
  );
}
