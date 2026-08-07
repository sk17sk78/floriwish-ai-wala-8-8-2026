"use client";

// hooks
import { useEffect, useState } from "react";

// redux
import {
  createOrderAction,
  selectOrder
} from "@/store/features/dynamic/orderSlice";
import { useDispatch, useSelector } from "@/store/withType";
import {
  createCartAction,
  selectCart
} from "@/store/features/dynamic/cartSlice";
import {
  createCustomerAction,
  selectCustomer
} from "@/store/features/users/customerSlice";
import {
  createContentAction,
  selectContent
} from "@/store/features/contents/contentSlice";
import {
  createCityAction,
  selectCity
} from "@/store/features/presets/citySlice";

// layouts
import AdminTableLayout from "@/layouts/admin/table/AdminTableLayout";

// utils
import getDocumentsFromFormFieldsGenerator from "./utils/getDocumentsFromFormFieldsGenerator";
import getTableContentGenerator from "./utils/getTableContentGenerator";
import GetTableFilterKeywordOptions from "./utils/GetTableFilterKeywordOptions";

// components
import TableFormFields from "./components/TableFormFields";

// types
import { type FilterKeywordOptions } from "@/common/types/redux/filterOption";
import { type OrderDocument } from "@/common/types/documentation/dynamic/order";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { allPermissions } from "@/common/constants/values";

export default function OrderInProgressTable({
  userName,
  isSuperAdmin,
  permission
}: {
  userName?: string;
  isSuperAdmin?: boolean;
  permission?: PermissionDocument;
}) {
  // hooks
  const dispatch = useDispatch();

  // redux states
  const cartStatus = useSelector(selectCart.status);

  const { documents: carts } = useSelector((state) =>
    selectCart.documentList(state, {
      defaultFilterBy: "isOrdered",
      defaultFilterKeyword: "true",
      sortBy: "updatedAt",
      orderBy: "desc"
    })
  );

  const customerStatus = useSelector(selectCustomer.status);

  const { documents: customers } = useSelector((state) =>
    selectCustomer.documentList(state, {
      sortBy: "createdAt",
      orderBy: "desc"
    })
  );

  const contentStatus = useSelector(selectContent.status);

  const { documents: contents } = useSelector((state) =>
    selectContent.documentList(state, {
      sortBy: "name",
      orderBy: "asc"
    })
  );

  const cityStatus = useSelector(selectCity.status);

  const { documents: cities } = useSelector((state) =>
    selectCity.documentList(state)
  );

  // states
  const [filterKeywordOptions, setFilterKeywordOptions] = useState<
    FilterKeywordOptions<OrderDocument>
  >({});

  // event handlers
  const handleRefresh = () => {
    dispatch(createCartAction.fetchDocumentList());
    dispatch(createCustomerAction.fetchDocumentList());
    dispatch(createCityAction.fetchDocumentList());
  };

  // side effects
  useEffect(() => {
    if (cartStatus === "idle") {
      dispatch(createCartAction.fetchDocumentList());
    }
  }, [cartStatus, dispatch]);

  useEffect(() => {
    if (customerStatus === "idle") {
      dispatch(createCustomerAction.fetchDocumentList());
    }
  }, [customerStatus, dispatch]);

  useEffect(() => {
    if (contentStatus === "idle") {
      dispatch(createContentAction.fetchDocumentList());
    }
  }, [contentStatus, dispatch]);

  useEffect(() => {
    if (cityStatus === "idle") {
      dispatch(createCityAction.fetchDocumentList());
    }
  }, [cityStatus, dispatch]);

  return (
    <>
      <GetTableFilterKeywordOptions onReturnOptions={setFilterKeywordOptions} />
      <AdminTableLayout
        userName={userName}
        isSuperAdmin={isSuperAdmin}
        permission={allPermissions}
        collectionName="Running Orders"
        documentName="Running Order"
        createAction={createOrderAction}
        select={selectOrder}
        defaultFilterBy="payment.status"
        defaultFilterKeyword="completed"
        filterFunction={({ cart }) => {
          if (!carts.length) return false;

          const associatedCart = carts.find(
            ({ _id }) => String(_id) === String(cart)
          );

          return Boolean(
            associatedCart?.items.filter(
              ({ status }) =>
                status === "preparing" || status === "on-the-way"
            ).length
          );
        }}
        filterKeywordOptions={filterKeywordOptions}
        getContent={getTableContentGenerator({
          permission: allPermissions,
          carts,
          customers,
          contents,
          cities
        })}
        getFormFields={({ initialDocument }) => (
          <TableFormFields initialDocument={initialDocument} />
        )}
        getDocumentsFromFormFields={getDocumentsFromFormFieldsGenerator()}
        customRefresh={handleRefresh}
      />
    </>
  );
}
