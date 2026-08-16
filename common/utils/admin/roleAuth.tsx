"use client";
import { useEffect } from "react";
import { ADMIN_ROOT_ROUTE } from "@/common/utils/admin/sidebar";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/auth/useAdminAuth";
import { SIDEBAR_SECTIONS } from "@/common/routes/admin/sidebarSections";

export default function AdminRoleAuth({
  sectionSlug,
  subSectionSlug
}: {
  sectionSlug: string;
  subSectionSlug?: string;
}) {
  const { replace } = useRouter();
  const {
    status,
    data: { authorizedSections, isAuthenticated, isSuperAdmin }
  } = useAdminAuth();

  const normalize = (str?: string) => (str || "").replace(/[-_]/g, "").toLowerCase();

  const targetSection = normalize(sectionSlug);
  const targetSubSection = normalize(subSectionSlug);

  // Pick from authorizedSections (or fallback to SIDEBAR_SECTIONS for superAdmin)
  const sectionsList = (authorizedSections && authorizedSections.length > 0)
    ? authorizedSections
    : isSuperAdmin
    ? SIDEBAR_SECTIONS
    : [];

  const relevantComponent = sectionsList.find(({ sectionName: name }) =>
    normalize(name) === targetSection
  );

  let targetComponent: React.ReactNode = null;

  if (relevantComponent) {
    if (targetSubSection && "subSections" in relevantComponent) {
      const relevantSubSectionComponent = relevantComponent.subSections.find(
        ({ sectionName: name }) => normalize(name as string) === targetSubSection
      );
      if (relevantSubSectionComponent && "component" in relevantSubSectionComponent) {
        targetComponent = relevantSubSectionComponent.component;
      }
    } else if ("component" in relevantComponent) {
      targetComponent = relevantComponent.component;
    }
  }

  useEffect(() => {
    if (status === "idle") {
      if (!isAuthenticated) {
        replace(`/${ADMIN_ROOT_ROUTE}/login`);
      } else if (!targetComponent && sectionsList.length > 0) {
        replace(`/${ADMIN_ROOT_ROUTE}`);
      }
    }
  }, [status, isAuthenticated, targetComponent, sectionsList, replace]);

  if (targetComponent) {
    return <>{targetComponent}</>;
  }

  if (status === "initial" || status === "pending") {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e1628]" />
      </div>
    );
  }

  return null;
}
