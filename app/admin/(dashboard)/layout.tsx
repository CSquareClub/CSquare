import GridBackground from "@/components/grid-background";
import AdminSessionProvider from "./provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";

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
      {/* <GridBackground /> */}
      <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <AdminHeader />
        {children}
      </main>
    </div>
    </AdminSessionProvider>
  );
}
