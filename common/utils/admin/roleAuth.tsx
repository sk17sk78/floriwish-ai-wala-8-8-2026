"use client";
import { ADMIN_ROOT_ROUTE } from "@/common/utils/admin/sidebar";
import { useRouter } from "next/navigation";
import { kebabToCamelCase } from "@/common/utils/case";
import { useAdminAuth } from "@/hooks/auth/useAdminAuth";

export default function AdminRoleAuth({
  sectionSlug,
  subSectionSlug
}: {
  sectionSlug: string;
  subSectionSlug?: string;
}) {
  const { replace } = useRouter();
  const {
    data: { authorizedSections }
  } = useAdminAuth();

  const sectionName = kebabToCamelCase(sectionSlug);
  const subSectionName = subSectionSlug ? kebabToCamelCase(subSectionSlug) : "";

  const relevantComponent = authorizedSections?.find(({ sectionName: name }) => name.toLowerCase() === sectionName.toLowerCase());
  if (relevantComponent) {
    if (subSectionName && 'subSections' in relevantComponent) {
      const relevantSubSectionComponent = relevantComponent.subSections.find(({ sectionName: name }) => name.toLowerCase() === subSectionName.toLowerCase());
      if (relevantSubSectionComponent && 'component' in relevantSubSectionComponent)
        return relevantSubSectionComponent.component;
    }
    else if ('component' in relevantComponent)
      return relevantComponent.component;
  }

  replace(`/${ADMIN_ROOT_ROUTE}`);
}
