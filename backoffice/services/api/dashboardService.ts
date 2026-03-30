import { mockUsers } from "../../assets/mock/users";

export type DashboardMetrics = {
  activeResidents: number;
  pendingApprovals: number;
  monthlyRevenue: string;
  openTickets: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    activeResidents: mockUsers.filter((user) => user.status === "Active").length,
    pendingApprovals: mockUsers.filter((user) => user.status === "Pending").length,
    monthlyRevenue: "₹ 12,48,500",
    openTickets: 17
  };
}
