import { useEffect, useState } from "react";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";
import { getDashboardMetrics, type DashboardMetrics } from "../../../services/api/dashboardService";

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    void getDashboardMetrics().then(setMetrics);
  }, []);

  return (
    <PageContainer title="Dashboard" subtitle="SaaS-level overview of operations and platform health.">
      <div className="bo-grid bo-grid-4">
        <Card title="Active Residents">
          <p className="bo-kpi">{metrics?.activeResidents ?? "--"}</p>
        </Card>
        <Card title="Pending Approvals">
          <p className="bo-kpi">{metrics?.pendingApprovals ?? "--"}</p>
        </Card>
        <Card title="Monthly Revenue">
          <p className="bo-kpi">{metrics?.monthlyRevenue ?? "--"}</p>
        </Card>
        <Card title="Open Tickets">
          <p className="bo-kpi">{metrics?.openTickets ?? "--"}</p>
        </Card>
      </div>
    </PageContainer>
  );
}
