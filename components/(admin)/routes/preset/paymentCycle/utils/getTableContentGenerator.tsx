// libraries
import moment from "moment";

// components
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type PaymentCycleDocument } from "@/common/types/documentation/presets/paymentCycle";
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
  }: AdminTableData<PaymentCycleDocument>): TableContent => ({
    header: [
      {
        label: "Label",
        span: 6,
        sortable: true,
        currSortValue: sortBy === "label" ? orderBy : "none",
        setSortValue: () => {
          onSort({ newSortBy: "label" });
        }
      },
      {
        label: "Days",
        span: 4,
        sortable: true,
        currSortValue: sortBy === "days" ? orderBy : "none",
        setSortValue: () => {
          onSort({ newSortBy: "days" });
        }
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
        label,
        days,
        isActive,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt
      }) => ({
        cols: [
          {
            value: {
              label: label,
              type: "text",
              align: "left"
            },
            action: { action: () => {}, type: "none" }
          },
          {
            value: {
              label: days.toString(),
              type: "text",
              align: "center"
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
