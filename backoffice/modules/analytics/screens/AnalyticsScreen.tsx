import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";

export default function AnalyticsScreen() {
  return (
    <PageContainer title="Analytics" subtitle="KPI and trend placeholders prepared for chart integration.">
      <div className="bo-grid bo-grid-3">
        <Card title="Daily Active Residents">
          <p className="bo-kpi">2,134</p>
          <p className="bo-meta bo-positive">+12.8% this week</p>
        </Card>
        <Card title="Gate Entries (Today)">
          <p className="bo-kpi">786</p>
          <p className="bo-meta">Peak hour: 8:30 AM</p>
        </Card>
        <Card title="Payment Collection Rate">
          <p className="bo-kpi">94.2%</p>
          <p className="bo-meta bo-positive">+3.1% vs last month</p>
        </Card>
      </div>
      <Card title="Engagement Trend" subtitle="Chart component slot for analytics engine integration">
        <div className="bo-chart-placeholder">
          <span>Chart Area</span>
        </div>
      </Card>
    </PageContainer>
  );
}
