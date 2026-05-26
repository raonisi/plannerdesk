import { auth } from "@/auth";
import { canAccessAdmin } from "@/lib/auth/rbac";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "관리자 데스크 | 플래너데스크",
  description: "플래너데스크 운영 자료를 관리하기 위한 공간입니다.",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    return <AdminLockedState />;
  }

  if (!canAccessAdmin(session)) {
    return <AdminAccessDeniedState />;
  }

  return <AdminShell session={session} />;
}
