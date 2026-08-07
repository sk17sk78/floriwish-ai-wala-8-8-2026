// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// libraries
import moment from "moment";

// requests
import { revalidateServicePage } from "../requests/revalidateServicePage";

// components
import NextImage from "@/components/custom/NextImage";
import ContentCustomizationInfoFormDialog from "../../content/ContentCustomizationInfoFormDialog";
import ContentDeliveryInfoFormDialog from "../../content/ContentDeliveryInfoFormDialog";
import ContentVisualInfoFormDialog from "../../content/ContentVisualInfoFormDialog";
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";

const getTableContentGenerator =
  ({
    permission,
    contentCategories,
    images
  }: {
    permission?: PermissionDocument;
    contentCategories: ContentCategoryDocument[];
    images: ImageDocument[];
  }) =>
  ({
    documents,
    populatedDocuments,
    state: {
      pagination: { offset },
      query: { sortBy, orderBy },
      trash: { showTrash }
    },
    method: {
      onUpdate,
      onUpdateDocument,
      onActivate,
      onDeactivate,
      onTrash,
      onRestore,
      onDelete,
      onSort,
      onShowToast
    }
  }: AdminTableData<ContentDocument>): TableContent => ({
    header: [
      {
        label: "Image",
        span: 1,
        sortable: false
      },
      {
        label: "Name",
        span: 3,
        sortable: true,
        currSortValue: sortBy === "name" ? orderBy : "none",
        setSortValue: () => {
          onSort({ newSortBy: "name" });
        }
      },
      {
        label: "Category",
        span: 3,
        sortable: false
      },
      {
        label: "Data",
        span: 2,
        sortable: false
      },
      {
        label: "Actions",
        span: 2,
        sortable: false
      }
    ],

    data: documents.map((document, i) => {
      const {
        _id,
        name,
        slug,
        media,
        category,
        isActive,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt
      } = document;

      const primaryImage = media?.primary;
      const primaryCategory = category?.primary;

      const populatedDocument = populatedDocuments?.find(
        ({ _id: populatedId }) => String(populatedId) === String(_id)
      );

      const filled = Boolean(
        populatedDocument?.brand &&
          populatedDocument?.detail &&
          populatedDocument?.seoMeta &&
          populatedDocument?.availability &&
          populatedDocument?.delivery &&
          populatedDocument?.price
      );

      const imageDocument = images.find(({ _id }) => String(_id) === String(primaryImage));

      return {
        cols: [
          {
            value: {
              label: imageDocument ? (
                <NextImage
                  className="w-[30px] h-[30px] rounded-md object-cover object-center"
                  src={imageDocument?.url || ""}
                  alt={
                    imageDocument?.alt || imageDocument?.defaultAlt || "Image"
                  }
                  width={30}
                  height={30}
                />
              ) : (
                <div className="w-[30px] h-[30px] bg-neutral-700 rounded-md"></div>
              ),
              type: "svg",
              align: "left"
            },
            action: { action: () => {}, type: "none" }
          },
          {
            value: {
              label: name,
              type: "text",
              align: "left"
            },
            action: { action: () => {}, type: "none" }
          },
          {
            value: {
              label:
                contentCategories.find(({ _id }) => String(_id) === String(primaryCategory))
                  ?.name || "",
              type: "text",
              align: "center"
            },
            action: {
              action: () => {},
              type: "component"
            }
          },
          {
            value: {
              label: (
                <div className="flex items-center justify-center gap-2">
                  <ContentVisualInfoFormDialog
                    initialDocumentId={(() => String(_id))()}
                    onUpdate={(updatedDocument: Partial<ContentDocument>) => {
                      onUpdateDocument({
                        documentId: String(_id),
                        updatedDocument
                      });
                    }}
                  />
                  <ContentDeliveryInfoFormDialog
                    initialDocumentId={(() => String(_id))()}
                    onUpdate={(updatedDocument: Partial<ContentDocument>) => {
                      onUpdateDocument({
                        documentId: String(_id),
                        updatedDocument
                      });
                    }}
                  />
                  <ContentCustomizationInfoFormDialog
                    initialDocumentId={(() => String(_id))()}
                    onUpdate={(updatedDocument: Partial<ContentDocument>) => {
                      onUpdateDocument({
                        documentId: String(_id),
                        updatedDocument
                      });
                    }}
                  />
                </div>
              ),
              type: "svg",
              align: "center"
            },
            action: { action: () => {}, type: "component" }
          },
          {
            value: {
              label: (
                <TupleActions
                  showActiveInactive={!showTrash}
                  canActive={filled}
                  isActive={isActive}
                  showRevalidateCache={true}
                  onClickRevalidateCache={() => {
                    revalidateServicePage(slug)
                      .then(() => {
                        onShowToast({
                          variant: "success",
                          title: "Success",
                          description: `Successfully revalidated "${name}"`
                        });
                      })
                      .catch(() => {
                        onShowToast({
                          variant: "destructive",
                          title: "Failed",
                          description: `Couldn't revalidated "${name}"`
                        });
                      });
                  }}
                  showEdit={Boolean(permission?.update) && !showTrash}
                  showRestore={showTrash}
                  showDrop={Boolean(permission?.delete) && !showTrash}
                  dropConfirmationDialogTitle="Move to Trash?"
                  showDelete={showTrash}
                  deleteConfirmationDialogTitle="Delete?"
                  onToggleActiveInactive={
                    isActive
                      ? () => {
                          onDeactivate({ documentId: String(_id) });
                        }
                      : () => {
                          onActivate({ documentId: String(_id) });
                        }
                  }
                  onClickEdit={() => {
                    onUpdate({ documentId: String(_id) });
                  }}
                  onClickRestore={() =>
                    onRestore({ documentId: String(_id) })
                  }
                  onClickDrop={() => onTrash({ documentId: String(_id) })}
                  onClickDelete={() => onDelete({ documentId: String(_id) })}
                  showExternalLink
                  linkHref={`/s/${slug}`}
                />
              ),
              type: "svg"
            },
            action: { action: () => {}, type: "component" }
          }
        ],
        batchSelectData: String(_id),
        hoverData: undefined
      };
    }),
    offset
  });

export default getTableContentGenerator;
