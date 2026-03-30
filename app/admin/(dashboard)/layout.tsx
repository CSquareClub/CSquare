import AdminSessionProvider from "./provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin | C Square Club",
  description: "C Square Club administration panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if(!session || !session.user){
    redirect('/admin/login');
  }
  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
