import { redirect } from "next/navigation";
import UserDashboard from "@/containers/dashboard/user-dashboard";

export default function DashboardPage() {
  // This will be handled by middleware or auth check
  // For now, we'll let the component handle the auth state
  return <UserDashboard />;
}
