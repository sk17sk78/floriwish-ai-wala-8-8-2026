// models
import MODELS from "@/db/mongoose/models";

// utils
import getHandler from "@/common/utils/api/getHandler";

// types
import {
  type FranchiseEnquiryDocument,
  type FranchiseEnquiryModel
} from "@/common/types/documentation/actions/franchiseEnquiry";

const {
  getDocuments,
  getDocument,
  addDocuments,
  updateDocument,
  deleteDocument
} = getHandler<FranchiseEnquiryDocument, FranchiseEnquiryModel>(
  MODELS.FranchiseEnquiries
);

export const handleGetFranchiseEnquiries = getDocuments();
export const handleGetFranchiseEnquiry = getDocument();
export const handleAddFranchiseEnquiries = addDocuments();
export const handleUpdateFranchiseEnquiry = updateDocument();
export const handleDeleteFranchiseEnquiry = deleteDocument();

