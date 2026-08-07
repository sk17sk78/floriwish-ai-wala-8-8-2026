// models
import MODELS from "@/db/mongoose/models";

// utils
import getHandler from "@/common/utils/api/getHandler";

// types
import {
  type VendorRegistrationDocument,
  type VendorRegistrationModel
} from "@/common/types/documentation/actions/vendorRegistration";

const {
  getDocuments,
  getDocument,
  addDocuments,
  updateDocument,
  deleteDocument
} = getHandler<VendorRegistrationDocument, VendorRegistrationModel>(
  MODELS.VendorRegistrations
);

export const handleGetVendorRegistrations = getDocuments();
export const handleGetVendorRegistration = getDocument();
export const handleAddVendorRegistrations = addDocuments();
export const handleUpdateVendorRegistration = updateDocument();
export const handleDeleteVendorRegistration = deleteDocument();

