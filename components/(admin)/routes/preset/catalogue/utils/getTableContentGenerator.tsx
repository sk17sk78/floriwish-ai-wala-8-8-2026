// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// libraries

// components
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";
import NextImage from "@/components/custom/NextImage";

// types
import { type CatalogueCategoryDocument } from "@/common/types/documentation/categories/catalogueCategory";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type CatalogueDocument } from "@/common/types/documentation/presets/catalogue";
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";

const getTableContentGenerator =
  ({
    permission,
    catalogueCategories,
    images,
    isSuperAdmin
  }: {
    permission?: PermissionDocument;
    catalogueCategories: CatalogueCategoryDocument[];
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
        onActivate,
        onDeactivate,
        onTrash,
        onRestore,
        onDelete,
        onSort
      }
    }: AdminTableData<CatalogueDocument>): TableContent => ({
      header: [
        {
          label: "Image",
          span: 1,
          sortable: false
        },
        {
          label: "Name",
          span: 3,
          align: "left",
          sortable: true,
          currSortValue: sortBy === "name" ? orderBy : "none",
          setSortValue: () => {
            onSort({ newSortBy: "name" });
          }
        },
        {
          label: "URL",
          span: 3,
          align: "left",
          sortable: false
        },
        {
          label: "Category",
          span: 2,
          align: "left",
          sortable: false
        },
        {
          label: "Actions",
          span: 1,
          sortable: false
        }
      ],
      data: documents.map(
        ({
          _id,
          category,
          name,
          path,
          icon,
          isActive,
          createdBy,
          createdAt,
          updatedBy,
          updatedAt
        }) => {
          const imageDocument = images.find(({ _id }) => String(_id) === String( icon));

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
                  label: path,
                  type: "text",
                  align: "left"
                },
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label:
                    catalogueCategories.find(({ _id }) => String(_id) === String( category))
                      ?.name || "",
                  type: "text",
                  align: "left"
                },
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label: (
                    <TupleActions
                      isSuperAdmin={isSuperAdmin}
                      showActiveInactive={!showTrash}
                      isActive={isActive}
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
                      onClickDelete={() =>
                        onDelete({ documentId: String(_id) })
                      }
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
