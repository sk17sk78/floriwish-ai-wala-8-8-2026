// libraries
import moment from "moment";

// components
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";

// icons
import { Building2 } from "lucide-react";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";
import { type StateDocument } from "@/common/types/documentation/presets/state";

const getTableContentGenerator =
  ({
    permission,
    states
  }: {
    permission?: PermissionDocument;
    states: StateDocument[];
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
  }: AdminTableData<CityDocument>): TableContent => ({
    header: [
      {
        label: "City",
        span: 5,
        sortable: true,
        currSortValue: sortBy === "name" ? orderBy : "none",
        setSortValue: () => {
          onSort({ newSortBy: "name" });
        }
      },
      {
        label: "State",
        span: 5,
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
        state,
        name,
        aliases,
        isTopCity,
        isActive,
        createdBy,
        createdAt,
        updatedBy,
        updatedAt
      }) => ({
        cols: [
          {
            value: {
              label: (
                <span className="flex items-center justify-center gap-2">
                  <span>{`${name}${aliases?.length ? ` (${aliases.join(", ")})` : ""}`}</span>
                  {isTopCity && (
                    <Building2
                      strokeWidth={2}
                      width={15}
                      height={15}
                    />
                  )}
                </span>
              ),
              type: "svg"
            },
            action: { action: () => {}, type: "none" }
          },
          {
            value: {
              label:
                states.find(({ _id }) => String(_id) === String( (state as string)))?.name || "",
              type: "text",
              align: "left"
            },
            action: {
              action: () => {},
              type: "component"
            }
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
