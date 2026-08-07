// models
import MODELS from "@/db/mongoose/models";

// utils
import getHandler from "@/common/utils/api/getHandler";

// types
import {
  type SupportMessageDocument,
  type SupportMessageModel
} from "@/common/types/documentation/actions/supportMessage";

const {
  getDocuments,
  getDocument,
  addDocuments,
  updateDocument,
  deleteDocument
} = getHandler<SupportMessageDocument, SupportMessageModel>(
  MODELS.SupportMessages
);

export const handleGetSupportMessages = getDocuments();
export const handleGetSupportMessage = getDocument();
export const handleAddSupportMessages = addDocuments();
export const handleUpdateSupportMessage = updateDocument();
export const handleDeleteSupportMessage = deleteDocument();
