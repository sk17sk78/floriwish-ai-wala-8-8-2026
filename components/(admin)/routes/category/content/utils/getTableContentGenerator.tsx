// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// libraries
import moment from "moment";

// requests
import { revalidateContentCategoryPage } from "../requests/revalidateContentCategoryPage";

// components
import ContentCategoryPersonalizedReviewsForm from "../components/ContentCategoryPersonalizedReviewsForm";
import NextImage from "@/components/custom/NextImage";
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";

const getTableContentGenerator =
  ({
    permission,
    images,
    isSuperAdmin
  }: {
    permission?: PermissionDocument;
    images: ImageDocument[];
    isSuperAdmin?: boolean;
  }) =>
    ({
      documents,
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
    }: AdminTableData<ContentCategoryDocument>): TableContent => ({
      header: [
        {
          label: "Image",
          span: 1,
          sortable: false
        },
        {
          label: "Name",
          span: 6,
          sortable: true,
          align: "left",
          currSortValue: sortBy === "name" ? orderBy : "none",
          setSortValue: () => {
            onSort({ newSortBy: "name" });
          }
        },
        {
          label: "Slug",
          span: 6,
          sortable: false,
          align: "left"
        },
        {
          label: "Reviews",
          span: 3,
          sortable: false
        },
        {
          label: "Actions",
          span: 3,
          sortable: false
        }
      ],
      data: documents.map(
        ({
          _id,
          name,
          slug,
          media,
          personalizedReviews,
          isActive,
        }) => {
          const icon = media?.icon;
          const imageDocument = images.find(({ _id }) => String(_id) === String(icon));

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
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label: name,
                  type: "text",
                  align: "left"
                },
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label: slug,
                  type: "text",
                  align: "left"
                },
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label: (
                    <ContentCategoryPersonalizedReviewsForm
                      initialReviews={personalizedReviews || []}
                      onUpdate={(
                        updatedDocument: Partial<ContentCategoryDocument>
                      ) => {
                        onUpdateDocument({
                          documentId: String(_id),
                          updatedDocument
                        });
                      }}
                    />
                  ),
                  type: "svg",
                  align: "center"
                },
                action: { action: () => { }, type: "component" }
              },
              {
                value: {
                  label: (
                    <TupleActions
                      isSuperAdmin={isSuperAdmin}
                      showActiveInactive={!showTrash}
                      isActive={isActive}
                      showRevalidateCache={true}
                      onClickRevalidateCache={() => {
                        revalidateContentCategoryPage(slug)
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
                      showEdit={true}
                      showRestore={showTrash}
                      showDrop={true}
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
                      onClickDelete={() =>
                        onDelete({ documentId: String(_id) })
                      }
                      showExternalLink
                      linkHref={`/${slug}`}
                    />
                  ),
                  type: "svg"
                },
                action: { action: () => { }, type: "component" }
              }
            ],
            batchSelectData: String(_id),
            hoverData: undefined
          };
        }
      ),
      offset
    });

export default getTableContentGenerator;
