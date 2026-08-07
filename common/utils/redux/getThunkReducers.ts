import { type Document as MongooseDocument } from "mongoose";
import { type DocumentKeyOptions } from "@/common/types/utils";
import { type PayloadAction } from "@reduxjs/toolkit";
import { type ResponseDataType } from "@/common/types/apiTypes";
import { type SliceState } from "@/common/types/redux/redux";
import { type ToastType } from "@/common/types/toast";
import { type Draft, type WritableDraft } from "immer";

const getThunkReducers = <Document extends MongooseDocument>({
  select
}: {
  select: DocumentKeyOptions<Document>;
}) => {
  const handlePending = (
    state: any,
    action: any
  ) => {
    state.status = "pending";
  };

  const handleRejected = (
    state: any,
    action: any
  ) => {
    state.status = "rejected";

    state.notifications.push(...(action?.payload || []));
  };

  const handleFetchDocumentList = (
    state: any,
    action: PayloadAction<ResponseDataType<Document[]>>
  ) => {
    state.status = "fulfilled";

    state.documentList = action.payload.data as WritableDraft<Document[]>;
    state.documents = [];
  };

  const handleFetchDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    state.documents.push(action.payload.data as Draft<Document>);
  };

  const handleFetchDocuments = (
    state: any,
    action: PayloadAction<ResponseDataType<Document[]>>
  ) => {
    state.status = "fulfilled";

    state.documents = action.payload.data as WritableDraft<Document[]>;
  };

  const handleAddDocuments = (
    state: any,
    action: PayloadAction<ResponseDataType<Document | Document[]>>
  ) => {
    state.status = "fulfilled";

    if (Array.isArray(action.payload.data)) {
      state.documentList.push(
        ...((action.payload.data as Document[])
          .filter((newDocument: any) => newDocument)
          .map((newDocument: any) => {
            const documentListItem = { _id: newDocument._id } as Document;

            for (let key of select) {
              let validKey = key.toString();

              if (validKey.includes(".")) {
                validKey = validKey.split(".")[0];
              }

              // @ts-ignore
              documentListItem[validKey] = newDocument[validKey];
            }

            return documentListItem;
          }) as WritableDraft<Document[]>)
      );

      state.documents.push(
        ...((action.payload.data as Document[]).filter(
          (newDocument: any) => newDocument
        ) as WritableDraft<Document[]>)
      );

      const addedCount = action?.payload.data.filter((item) => item).length;

      state.notifications.push(...(action?.payload.messages || []), {
        type: addedCount ? "success" : "error",
        message: `${addedCount ? "" : "Not "}Added!${action?.payload.data.length > 1 ? ` (${action?.payload.data.filter((item) => item).length}/${action.payload.data.length})` : ""}`
      });
    } else {
      state.documentList.push(
        ...([action.payload.data as Document].map((newDocument: any) => {
          const documentListItem = { _id: newDocument._id } as Document;

          for (let key of select) {
            let validKey = key.toString();

            if (validKey.includes(".")) {
              validKey = validKey.split(".")[0];
            }

            // @ts-ignore
            documentListItem[validKey] = newDocument[validKey];
          }

          return documentListItem;
        }) as WritableDraft<Document[]>)
      );

      state.documents.push(action.payload.data as Draft<Document>);
      state.notifications.push({ type: "success", message: "Added!" });
    }
  };

  const handleUpdateDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    const newDocument = action.payload.data as Draft<Document>;

    state.documents = [...state.documents].map((document: any) =>
      String(document._id) === String(newDocument._id) ? newDocument : document
    );

    const existingListItem = state.documentList.find(
      (document: any) => String(document._id) === String(newDocument._id)
    );

    if (existingListItem) {
      for (let key of select) {
        let validKey = key.toString();

        if (validKey.includes(".")) {
          validKey = validKey.split(".")[0];
        }

        // @ts-ignore
        existingListItem[validKey] = newDocument[validKey];
      }
    }

    state.notifications.push({ type: "success", message: "Updated!" });
  };

  const handleActivateDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    const { _id } = action.payload.data as Document;

    const existingItem = state.documents.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingItem) {
      (existingItem as Draft<Document> & { isActive: boolean }).isActive = true;
    }

    const existingListItem = state.documentList.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingListItem) {
      (existingListItem as Draft<Document> & { isActive: boolean }).isActive =
        true;
    }

    state.notifications.push({ type: "success", message: "Activated!" });
  };

  const handleActivateDocuments = (
    state: any,
    action: PayloadAction<{
      documentIds: string[];
      response: ResponseDataType<boolean>;
    }>
  ) => {
    state.status = "fulfilled";

    const { documentIds, response } = action.payload;

    if (response.data) {
      documentIds.forEach((_id) => {
        const existingItem = state.documents.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingItem) {
          (existingItem as Draft<Document> & { isActive: boolean }).isActive =
            true;
        }

        const existingListItem = state.documentList.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingListItem) {
          (
            existingListItem as Draft<Document> & { isActive: boolean }
          ).isActive = true;
        }
      });
    }

    state.notifications.push({ type: "success", message: "Activated!" });
  };

  const handleDeactivateDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    const { _id } = action.payload.data as Document;

    const existingItem = state.documents.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingItem) {
      (existingItem as Draft<Document> & { isActive: boolean }).isActive =
        false;
    }

    const existingListItem = state.documentList.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingListItem) {
      (existingListItem as Draft<Document> & { isActive: boolean }).isActive =
        false;
    }

    state.notifications.push({ type: "success", message: "Deactivated!" });
  };

  const handleDeactivateDocuments = (
    state: any,
    action: PayloadAction<{
      documentIds: string[];
      response: ResponseDataType<boolean>;
    }>
  ) => {
    state.status = "fulfilled";

    const { documentIds, response } = action.payload;

    if (response.data) {
      documentIds.forEach((_id) => {
        const existingItem = state.documents.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingItem) {
          (existingItem as Draft<Document> & { isActive: boolean }).isActive =
            false;
        }

        const existingListItem = state.documentList.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingListItem) {
          (
            existingListItem as Draft<Document> & { isActive: boolean }
          ).isActive = false;
        }
      });
    }

    state.notifications.push({ type: "success", message: "Deactivated!" });
  };

  const handleTrashDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    const { _id } = action.payload.data as Document;

    const existingItem = state.documents.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingItem) {
      (existingItem as Draft<Document> & { isActive: boolean }).isActive =
        false;
      (existingItem as Draft<Document> & { isDeleted: boolean }).isDeleted =
        true;
    }

    const existingListItem = state.documentList.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingListItem) {
      (existingListItem as Draft<Document> & { isActive: boolean }).isActive =
        false;
      (existingListItem as Draft<Document> & { isDeleted: boolean }).isDeleted =
        true;
    }

    state.notifications.push({ type: "success", message: "Trashed!" });
  };

  const handleTrashDocuments = (
    state: any,
    action: PayloadAction<{
      documentIds: string[];
      response: ResponseDataType<boolean>;
    }>
  ) => {
    state.status = "fulfilled";

    const { documentIds, response } = action.payload;

    if (response.data) {
      documentIds.forEach((_id) => {
        const existingItem = state.documents.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingItem) {
          (existingItem as Draft<Document> & { isActive: boolean }).isActive =
            false;
          (existingItem as Draft<Document> & { isDeleted: boolean }).isDeleted =
            true;
        }

        const existingListItem = state.documentList.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingListItem) {
          (
            existingListItem as Draft<Document> & { isActive: boolean }
          ).isActive = false;
          (
            existingListItem as Draft<Document> & { isDeleted: boolean }
          ).isDeleted = true;
        }
      });
    }

    state.notifications.push({ type: "success", message: "Trashed!" });
  };

  const handleRestoreDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    const { _id } = action.payload.data as Document;

    const existingItem = state.documents.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingItem) {
      (existingItem as Draft<Document> & { isDeleted: boolean }).isDeleted =
        false;
    }

    const existingListItem = state.documentList.find(
      (document: any) => String(document._id) === String(_id)
    );

    if (existingListItem) {
      (existingListItem as Draft<Document> & { isDeleted: boolean }).isDeleted =
        false;
    }

    state.notifications.push({ type: "success", message: "Restored!" });
  };

  const handleRestoreDocuments = (
    state: any,
    action: PayloadAction<{
      documentIds: string[];
      response: ResponseDataType<boolean>;
    }>
  ) => {
    state.status = "fulfilled";

    const { documentIds, response } = action.payload;

    if (response.data) {
      documentIds.forEach((_id) => {
        const existingItem = state.documents.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingItem) {
          (existingItem as Draft<Document> & { isDeleted: boolean }).isDeleted =
            false;
        }

        const existingListItem = state.documentList.find(
          (document: any) => String(document._id) === String(_id)
        );

        if (existingListItem) {
          (
            existingListItem as Draft<Document> & { isDeleted: boolean }
          ).isDeleted = false;
        }
      });
    }

    state.notifications.push({ type: "success", message: "Restored!" });
  };

  const handleSwapDocumentsOrder = (
    state: any,
    action: PayloadAction<{
      response: ResponseDataType<Document[]>;
    }>
  ) => {
    state.status = "fulfilled";

    const {
      response: { data }
    } = action.payload;

    if (data) {
      (data as Draft<Document[]>).forEach((updatedDocument: any) => {
        const existingItem = state.documents.find(
          (document: any) => String(document._id) === String(updatedDocument._id)
        );

        if (existingItem) {
          (existingItem as Draft<Document> & { order: number }).order = (
            updatedDocument as Draft<Document> & { order: number }
          ).order;
        }

        const existingListItem = state.documentList.find(
          (document: any) => String(document._id) === String(updatedDocument._id)
        );

        if (existingListItem) {
          (existingListItem as Draft<Document> & { order: number }).order = (
            updatedDocument as Draft<Document> & { order: number }
          ).order;
        }
      });
    }

    state.notifications.push({ type: "success", message: "Reordered!" });
  };

  const handleDeleteDocument = (
    state: any,
    action: PayloadAction<ResponseDataType<Document>>
  ) => {
    state.status = "fulfilled";

    const { _id } = action.payload.data as Document;

    const index = state.documents.findIndex((document: any) => String(document._id) === String(_id));

    if (index !== -1) {
      state.documents.splice(index, 1);
    }

    const listIndex = state.documentList.findIndex(
      (document: any) => String(document._id) === String(_id)
    );

    if (listIndex !== -1) {
      state.documentList.splice(listIndex, 1);
    }

    state.notifications.push({ type: "success", message: "Deleted!" });
  };

  const handleDeleteDocuments = (
    state: any,
    action: PayloadAction<{
      documentIds: string[];
      response: ResponseDataType<boolean>;
    }>
  ) => {
    state.status = "fulfilled";

    const { documentIds, response } = action.payload;

    if (response.data) {
      documentIds.forEach((_id) => {
        const index = state.documents.findIndex(
          (document: any) => String(document._id) === String(_id)
        );

        if (index !== -1) {
          state.documents.splice(index, 1);
        }

        const listIndex = state.documentList.findIndex(
          (document: any) => String(document._id) === String(_id)
        );

        if (listIndex !== -1) {
          state.documentList.splice(listIndex, 1);
        }
      });
    }

    state.notifications.push({ type: "success", message: "Deleted!" });
  };

  return {
    handleFetchDocumentList: {
      pending: handlePending,
      fulfilled: handleFetchDocumentList,
      rejected: handleRejected
    },
    handleFetchDocument: {
      pending: handlePending,
      fulfilled: handleFetchDocument,
      rejected: handleRejected
    },
    handleFetchDocuments: {
      pending: handlePending,
      fulfilled: handleFetchDocuments,
      rejected: handleRejected
    },
    handleAddDocuments: {
      pending: handlePending,
      fulfilled: handleAddDocuments,
      rejected: handleRejected
    },
    handleUpdateDocument: {
      pending: handlePending,
      fulfilled: handleUpdateDocument,
      rejected: handleRejected
    },
    handleActivateDocument: {
      pending: handlePending,
      fulfilled: handleActivateDocument,
      rejected: handleRejected
    },
    handleActivateDocuments: {
      pending: handlePending,
      fulfilled: handleActivateDocuments,
      rejected: handleRejected
    },
    handleDeactivateDocument: {
      pending: handlePending,
      fulfilled: handleDeactivateDocument,
      rejected: handleRejected
    },
    handleDeactivateDocuments: {
      pending: handlePending,
      fulfilled: handleDeactivateDocuments,
      rejected: handleRejected
    },
    handleTrashDocument: {
      pending: handlePending,
      fulfilled: handleTrashDocument,
      rejected: handleRejected
    },
    handleTrashDocuments: {
      pending: handlePending,
      fulfilled: handleTrashDocuments,
      rejected: handleRejected
    },
    handleRestoreDocument: {
      pending: handlePending,
      fulfilled: handleRestoreDocument,
      rejected: handleRejected
    },
    handleRestoreDocuments: {
      pending: handlePending,
      fulfilled: handleRestoreDocuments,
      rejected: handleRejected
    },
    handleSwapDocumentsOrder: {
      pending: handlePending,
      fulfilled: handleSwapDocumentsOrder,
      rejected: handleRejected
    },
    handleDeleteDocument: {
      pending: handlePending,
      fulfilled: handleDeleteDocument,
      rejected: handleRejected
    },
    handleDeleteDocuments: {
      pending: handlePending,
      fulfilled: handleDeleteDocuments,
      rejected: handleRejected
    }
  };
};

export default getThunkReducers;
