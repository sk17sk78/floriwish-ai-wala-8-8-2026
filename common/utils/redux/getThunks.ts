// libraries
import mongoose from "mongoose";

// utils
import { capitalize } from "@/common/utils/string";
import { createAsyncThunk } from "@/store/withType";
import { DocumentKeyOption, DocumentKeyOptions } from "@/common/types/utils";
import getRequest from "@/common/utils/api/getRequest";

// types
import { type Document as MongooseDocument } from "mongoose";
import {
  type SwapOrderType,
  type ResponseDataType
} from "@/common/types/apiTypes";
import { type ToastType } from "@/common/types/toast";
import { type SliceState } from "@/common/types/redux/redux";
import { type StateType } from "@/store/types";
import { type Query } from "@/common/types/api/query";

const CHUNK_SIZE = 500;

const getThunks = <Document extends MongooseDocument>({
  sliceName,
  documentName,
  apiRoute,
  select,
  populate,
  sortBy,
  orderBy
}: {
  sliceName: string;
  documentName: string;
  apiRoute: string;
  select?: DocumentKeyOptions<Document>;
  populate?: Query<Document>["populate"];
  sortBy?: DocumentKeyOption<Document>;
  orderBy?: "asc" | "desc";
}) => {
  // api requests
  const request = getRequest<Document>(apiRoute);

  // thunks
  const fetchDocumentList = createAsyncThunk<
    ResponseDataType<Document[]>,
    void,
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/fetch${capitalize(documentName)}List`,
    async (_, { rejectWithValue }) => {
      try {
        const count = (
          await request.fetchDocuments({
            // @ts-ignore
            select: ["_id"]
          })
        ).count;

        if (count) {
          const data = (
            await Promise.all(
              Array.from({
                length: Math.ceil(count / CHUNK_SIZE)
              }).map((_, i) =>
                request.fetchDocuments({
                  select,
                  populate,
                  sortBy,
                  orderBy,
                  offset: i * CHUNK_SIZE,
                  limit: CHUNK_SIZE
                })
              )
            )
          ).flatMap(({ data }) => data);

          return { data } as ResponseDataType<Document[]>;
        } else {
          return { data: [] as Document[] } as ResponseDataType<Document[]>;
        }

        // const response = await request.fetchDocuments({
        //   select,
        //   sortBy,
        //   orderBy
        // });

        // return response;
      } catch (err: any) {
        if (err?.response && err.response?.messages?.length) {
          return rejectWithValue(err.response.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const fetchDocument = createAsyncThunk<
    ResponseDataType<Document>,
    { documentId: string },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/fetch${capitalize(documentName)}`,
    async ({ documentId }, { rejectWithValue }) => {
      try {
        const response = await request.fetchDocument(documentId, {
          populate
        });

        return response;
      } catch (err: any) {
        if (err?.response && err.response?.messages?.length) {
          return rejectWithValue(err.response.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const fetchOrSelectDocument = createAsyncThunk<
    Document,
    { documentId: string },
    { state: StateType; rejectValue: ToastType[] }
  >(
    `${sliceName}/fetchOrSelect${capitalize(documentName)}`,
    async ({ documentId }, { getState, dispatch, rejectWithValue }) => {
      const state = getState();
      const existingCity = (
        state[sliceName as keyof StateType] as unknown as SliceState<Document>
      ).documents.find((document) => String(document._id) === documentId);

      if (existingCity) {
        return existingCity;
      } else {
        const resultAction = await dispatch(fetchDocument({ documentId }));
        if (fetchDocument.fulfilled.match(resultAction)) {
          return resultAction.payload.data as Document;
        } else {
          return rejectWithValue(resultAction.payload as ToastType[]);
        }
      }
    }
  );

  const fetchDocuments = createAsyncThunk<
    ResponseDataType<Document[]>,
    void,
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/fetch${capitalize(sliceName)}`,
    async (_, { rejectWithValue }) => {
      try {
        const response = await request.fetchDocuments({
          sortBy,
          orderBy,
          populate
        });

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const addDocuments = createAsyncThunk<
    ResponseDataType<Document | Document[]>,
    { newDocuments: Document | Document[] },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/add${capitalize(sliceName)}`,
    async ({ newDocuments }, { rejectWithValue }) => {
      try {
        if (Array.isArray(newDocuments)) {
          newDocuments = newDocuments.map((newDocument) => {
            newDocument._id = new mongoose.Types.ObjectId();

            return newDocument;
          });
        } else {
          newDocuments._id = new mongoose.Types.ObjectId();
        }

        const response = await request.addDocuments(newDocuments);

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const updateDocument = createAsyncThunk<
    ResponseDataType<Document>,
    {
      documentId: string;
      updateData: Partial<Document>;
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/update${capitalize(documentName)}`,
    async ({ documentId, updateData }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocument(
          documentId,
          { populate },
          updateData
        );

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const activateDocument = createAsyncThunk<
    ResponseDataType<Document>,
    {
      documentId: string;
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/activate${capitalize(documentName)}`,
    async ({ documentId }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocument(
          documentId,
          {
            active: false,
            deleted: false
          },
          { isActive: true } as Partial<Document> & { isActive: boolean }
        );

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const activateDocuments = createAsyncThunk<
    {
      documentIds: string[];
      response: ResponseDataType<boolean>;
    },
    {
      documentIds: string[];
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/activateMany${capitalize(documentName)}`,
    async ({ documentIds }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocuments(
          { ids: documentIds, active: false, deleted: false },
          { isActive: true } as Partial<Document> & { isActive: boolean }
        );

        return { documentIds, response };
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const deactivateDocument = createAsyncThunk<
    ResponseDataType<Document>,
    {
      documentId: string;
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/deactivate${capitalize(documentName)}`,
    async ({ documentId }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocument(
          documentId,
          {
            active: true,
            deleted: false
          },
          { isActive: false } as Partial<Document> & { isActive: boolean }
        );

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const deactivateDocuments = createAsyncThunk<
    {
      documentIds: string[];
      response: ResponseDataType<boolean>;
    },
    {
      documentIds: string[];
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/deactivateMany${capitalize(documentName)}`,
    async ({ documentIds }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocuments(
          { ids: documentIds, active: true, deleted: false },
          { isActive: false } as Partial<Document> & { isActive: boolean }
        );

        return { documentIds, response };
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const trashDocument = createAsyncThunk<
    ResponseDataType<Document>,
    {
      documentId: string;
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/trash${capitalize(documentName)}`,
    async ({ documentId }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocument(
          documentId,
          { deleted: false },
          { isActive: false, isDeleted: true } as Partial<Document> & {
            isActive: boolean;
            isDeleted: boolean;
          }
        );

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const trashDocuments = createAsyncThunk<
    {
      documentIds: string[];
      response: ResponseDataType<boolean>;
    },
    {
      documentIds: string[];
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/trashMany${capitalize(documentName)}`,
    async ({ documentIds }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocuments(
          { ids: documentIds, deleted: false },
          { isActive: false, isDeleted: true } as Partial<Document> & {
            isActive: boolean;
            isDeleted: boolean;
          }
        );

        return { documentIds, response };
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const restoreDocument = createAsyncThunk<
    ResponseDataType<Document>,
    {
      documentId: string;
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/restore${capitalize(documentName)}`,
    async ({ documentId }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocument(
          documentId,
          { deleted: true },
          { isDeleted: false } as Partial<Document> & {
            isDeleted: boolean;
          }
        );

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const restoreDocuments = createAsyncThunk<
    {
      documentIds: string[];
      response: ResponseDataType<boolean>;
    },
    {
      documentIds: string[];
    },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/restoreMany${capitalize(documentName)}`,
    async ({ documentIds }, { rejectWithValue }) => {
      try {
        const response = await request.updateDocuments(
          { ids: documentIds, deleted: true },
          { isDeleted: false } as Partial<Document> & {
            isDeleted: boolean;
          }
        );

        return { documentIds, response };
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const swapDocumentsOrder = createAsyncThunk<
    { response: ResponseDataType<Document[]> },
    { swapOrder: SwapOrderType },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/swap${capitalize(sliceName)}Order`,
    async ({ swapOrder }, { rejectWithValue }) => {
      try {
        const response = await request.swapDocumentsOrder({
          swapOrder
        });

        return { response };
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const deleteDocument = createAsyncThunk<
    ResponseDataType<Document>,
    { documentId: string },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/delete${capitalize(documentName)}`,
    async ({ documentId }, { rejectWithValue }) => {
      try {
        const response = await request.deleteDocument(documentId, {
          deleted: true
        });

        return response;
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  const deleteDocuments = createAsyncThunk<
    {
      documentIds: string[];
      response: ResponseDataType<boolean>;
    },
    { documentIds: string[] },
    { rejectValue: ToastType[] }
  >(
    `${sliceName}/deleteMany${capitalize(documentName)}`,
    async ({ documentIds }, { rejectWithValue }) => {
      try {
        const response = await request.deleteDocuments({
          ids: documentIds,
          deleted: true
        });

        return { documentIds, response };
      } catch (err: any) {
        if (err?.messages && err.messages?.length) {
          return rejectWithValue(err.messages as ToastType[]);
        }

        return rejectWithValue([
          {
            type: "error",
            message: "Network Issue, Try Again"
          }
        ] as ToastType[]);
      }
    }
  );

  return {
    fetchDocumentList,
    fetchDocument,
    fetchOrSelectDocument,
    fetchDocuments,
    addDocuments,
    updateDocument,
    activateDocument,
    activateDocuments,
    deactivateDocument,
    deactivateDocuments,
    trashDocument,
    trashDocuments,
    restoreDocument,
    restoreDocuments,
    swapDocumentsOrder,
    deleteDocument,
    deleteDocuments
  };
};

export default getThunks;
