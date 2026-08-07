// libraries
import moment from "moment";

// components
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type ColorDocument } from "@/common/types/documentation/presets/color";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";

const getTableContentGenerator =
  ({ permission }: { permission?: PermissionDocument }) =>
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
  }: AdminTableData<ColorDocument>): TableContent => ({
    header: [
      {
        label: "Name",
        span: 5,
        sortable: true,
        currSortValue: sortBy === "name" ? orderBy : "none",
        setSortValue: () => {
          onSort({ newSortBy: "name" });
        }
      },
      {
        label: "Color",
        span: 5,
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
        name,
        hexCode,
        isActive,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt
      }) => ({
        cols: [
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
              label: (
                <div
                  className="w-8 h-8 rounded-md shadow-dark"
                  style={{ backgroundColor: hexCode }}
                ></div>
              ),
              type: "svg"
            },
            action: { action: () => {}, type: "none" }
          },
          {
            value: {
              label: (
                <TupleActions
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
                  onClickDelete={() => onDelete({ documentId: String(_id) })}
                />
              ),
              type: "svg"
            },
            action: { action: () => {}, type: "component" }
          }
        ],
        batchSelectData: String(_id),
        hoverData: undefined
      })
    ),
    offset
  });

export default getTableContentGenerator;
