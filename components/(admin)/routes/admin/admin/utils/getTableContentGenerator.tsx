// libraries

// components
import TupleActions from "@/components/(_common)/TableLayout/TupleActions";
import AdminStatus from "../components/AdminStatus";

// icons
import { ShieldPlus } from "lucide-react";

// types
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type AdminDocument } from "@/common/types/documentation/users/admin";
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";

const getTableContentGenerator =
  ({
    permission,
    isSuperAdmin: isCurrentUserSuperAdmin
  }: {
    permission?: PermissionDocument;
    isSuperAdmin?: boolean;
  }) =>
    ({
      documents,
      state: {
        pagination: { offset },
        query: { sortBy, orderBy },
        trash: { showTrash }
      },
      method: { onUpdate, onUpdateDocument, onTrash, onRestore, onDelete, onSort }
    }: AdminTableData<AdminDocument>): TableContent => ({
      header: [
        {
          label: "Username",
          span: 10,
          sortable: true,
          currSortValue: sortBy === "userName" ? orderBy : "none",
          setSortValue: () => {
            onSort({ newSortBy: "userName" });
          }
        },
        {
          label: "Role",
          span: 4,
          sortable: false
        },
        {
          label: "Status",
          span: 1,
          sortable: false
        },
        {
          label: "Actions",
          span: 1,
          sortable: false
        }
      ],

      data: documents
        .filter(({ userName }) => userName !== "keshavkumar")
        .map(
          ({
            _id,
            status,
            userName,
            isSuperAdmin,
            role,
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
                      <span>{userName}</span>
                      {isSuperAdmin && (
                        <ShieldPlus
                          strokeWidth={2}
                          width={15}
                          height={15}
                        />
                      )}
                    </span>
                  ),
                  type: "svg"
                },
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label: isSuperAdmin ? (
                    "Super Admin"
                  ) : (
                    (role as any)?.label || "No Role"
                  ),
                  type: "svg"
                },
                action: { action: () => { }, type: "none" }
              },
              {
                value: {
                  label: (
                    <AdminStatus
                      id={String(_id)}
                      status={status}
                      isDisabled={showTrash || (!isCurrentUserSuperAdmin && isSuperAdmin)}
                      onUpdateDocument={onUpdateDocument}
                    />
                  ),
                  type: "svg"
                },
                action: {
                  action: () => { },
                  type: "component"
                }
              },
              {
                value: {
                  label: (
                    <TupleActions
                      isSuperAdmin={isCurrentUserSuperAdmin}
                      showEdit={
                        Boolean(permission?.update) &&
                        !showTrash &&
                        (isCurrentUserSuperAdmin || !isSuperAdmin)
                      }
                      showRestore={showTrash}
                      showDrop={
                        Boolean(permission?.delete) &&
                        !showTrash &&
                        (isCurrentUserSuperAdmin || !isSuperAdmin)
                      }
                      dropConfirmationDialogTitle="Move to Trash?"
                      showDelete={showTrash && isCurrentUserSuperAdmin}
                      deleteConfirmationDialogTitle="Delete?"
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
          })
        ),
      offset
    });

export default getTableContentGenerator;
