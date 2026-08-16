import { AdminRolePermissionDocument } from "@/common/types/documentation/nestedDocuments/adminRolePermission";
import { allAdminRolePermission } from "../constants/permission";
import AdminRoleSection from "./AdminRoleSection";
import { CheckCircle2, PlusCircle, Shield, ShieldAlert, XCircle } from "lucide-react";

export default function AdminRoleInput({
  adminRolePermission,
  onChangeAdminRolePermission
}: {
  adminRolePermission: AdminRolePermissionDocument;
  onChangeAdminRolePermission: (
    newAdminRolePermission: AdminRolePermissionDocument
  ) => void;
}) {
  // Preset Handlers
  const handleApplyCreateOnly = () => {
    const newPermissions = {} as AdminRolePermissionDocument;
    Object.keys(allAdminRolePermission).forEach((key) => {
      newPermissions[key as keyof AdminRolePermissionDocument] = {
        isCustomized: false,
        all: { create: true, read: true, update: false, delete: false }
      };
    });
    onChangeAdminRolePermission(newPermissions);
  };

  const handleApplyFullAccess = () => {
    const newPermissions = {} as AdminRolePermissionDocument;
    Object.keys(allAdminRolePermission).forEach((key) => {
      newPermissions[key as keyof AdminRolePermissionDocument] = {
        isCustomized: false,
        all: { create: true, read: true, update: true, delete: true }
      };
    });
    onChangeAdminRolePermission(newPermissions);
  };

  const handleApplyReadOnly = () => {
    const newPermissions = {} as AdminRolePermissionDocument;
    Object.keys(allAdminRolePermission).forEach((key) => {
      newPermissions[key as keyof AdminRolePermissionDocument] = {
        isCustomized: false,
        all: { create: false, read: true, update: false, delete: false }
      };
    });
    onChangeAdminRolePermission(newPermissions);
  };

  const handleClearAll = () => {
    onChangeAdminRolePermission({} as AdminRolePermissionDocument);
  };

  return (
    <div className="w-full relative space-y-4">
      {/* Quick Action Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <Shield className="w-4 h-4 text-sienna-1" />
          <span>Quick Permission Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleApplyCreateOnly}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Only Create (Create Only)</span>
          </button>
          <button
            type="button"
            onClick={handleApplyReadOnly}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>View Only (Read Only)</span>
          </button>
          <button
            type="button"
            onClick={handleApplyFullAccess}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Full Access</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-600 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div
        className={`pt-4 pb-3 sticky top-0 bg-white grid grid-cols-[60px_1fr_60px_60px_60px_60px] overflow-y-hidden overflow-hidden text-xs justify-center text-center font-bold border-b border-neutral-100 z-10`}
      >
        <span>SELECT</span>
        <span className="text-left pl-2">SECTION NAME</span>
        <span className="text-emerald-700">CREATE</span>
        <span className="text-blue-700">READ</span>
        <span className="text-amber-700">UPDATE</span>
        <span className="text-rose-700">DELETE</span>
      </div>
      {Object.keys(allAdminRolePermission).map((key, i) => (
        <AdminRoleSection
          key={i}
          sectionKey={key}
          initialSectionPermission={
            allAdminRolePermission[key as keyof AdminRolePermissionDocument]
          }
          sectionPermission={
            adminRolePermission && adminRolePermission[key as keyof AdminRolePermissionDocument]
              ? adminRolePermission[key as keyof AdminRolePermissionDocument]
              : allAdminRolePermission[key as keyof AdminRolePermissionDocument] || {
                  isCustomized: false,
                  all: { create: false, read: false, update: false, delete: false },
                  custom: {}
                }
          }
          onChangeSectionPermission={({ isCustomized, all, custom }) => {
            const newAdminRolePermission = {
              ...adminRolePermission
            } as AdminRolePermissionDocument;

            if (
              !isCustomized &&
              !all.create &&
              !all.read &&
              !all.update &&
              !all.delete
            ) {
              delete newAdminRolePermission[
                key as keyof AdminRolePermissionDocument
              ];
            } else if (!isCustomized) {
              newAdminRolePermission[key as keyof AdminRolePermissionDocument] =
                {
                  isCustomized: false,
                  all: all
                };
            } else {
              newAdminRolePermission[key as keyof AdminRolePermissionDocument] =
                {
                  isCustomized: true,
                  custom: custom
                };
            }

            onChangeAdminRolePermission(newAdminRolePermission);
          }}
        />
      ))}
    </div>
  );
}
