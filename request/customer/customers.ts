// constants
import { DOMAIN } from "@/common/constants/domain";

// utils
import getRequest from "@/common/utils/api/getRequest";

// types
import { type CustomerDocument } from "@/common/types/documentation/users/customer";
import { type Query } from "@/common/types/api/query";

// variables
const API_URL = "/api/admin/user/customer";
const URL = DOMAIN ? `${DOMAIN}${API_URL}` : API_URL;

// requests
const { fetchDocument, updateDocument } = getRequest<CustomerDocument>(URL);

// exports
export const fetchCustomer = ({
  customerId,
  query
}: {
  customerId: string;
  query?: Query<CustomerDocument>;
}) => {
  if (!customerId || customerId === "undefined" || customerId === "null") {
    return Promise.resolve({ data: null, message: "Invalid customer ID", status: false, error: null } as any);
  }
  return fetchDocument(customerId, query || {}, { ssr: true });
};

export const updateCustomer = ({
  customerId,
  query,
  data
}: {
  customerId: string;
  query?: Query<CustomerDocument>;
  data: Partial<CustomerDocument>;
}) => {
  if (!customerId || customerId === "undefined" || customerId === "null") {
    return Promise.resolve({ data: null, message: "Invalid customer ID", status: false, error: null } as any);
  }
  return updateDocument(customerId, query || {}, data, { ssr: true });
};
