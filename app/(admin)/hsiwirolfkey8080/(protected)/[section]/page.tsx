// components
import AdminRoleAuth from "@/common/utils/admin/roleAuth";

export default function Dashboard({
  params: { section }
}: {
  params: { section: string };
}) {
  return <AdminRoleAuth sectionSlug={section} />;
}
