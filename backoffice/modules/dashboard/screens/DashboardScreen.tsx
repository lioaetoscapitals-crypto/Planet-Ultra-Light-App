import { useEffect, useState } from "react";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";
import { listEntities } from "../../../services/api/moduleService";
import { gateService } from "../../../services/api";
import type { ModuleKey } from "../../../services/api/types";

type Kpi = {
  title: string;
  value: string;
};

export default function DashboardScreen() {
  const [kpis, setKpis] = useState<Kpi[]>([
    { title: "Gate Logs", value: "--" },
    { title: "Pending Invitations", value: "--" },
    { title: "Pending Bookings", value: "--" },
    { title: "Published Notices", value: "--" }
  ]);

  useEffect(() => {
    const load = async () => {
      const [gate, invitations, bookings, notices] = await Promise.all([
        gateService.list(),
        listEntities("invitations"),
        listEntities("bookings"),
        listEntities("notices")
      ]);

      const next: Kpi[] = [
        { title: "Visitor Entries", value: String(gate.length) },
        {
          title: "Pending Invitations",
          value: String(invitations.filter((item) => String(item.status) === "Pending").length)
        },
        {
          title: "Pending Bookings",
          value: String(bookings.filter((item) => String(item.status) === "Pending").length)
        },
        {
          title: "Published Notices",
          value: String(notices.filter((item) => String(item.status) === "Published").length)
        }
      ];
      setKpis(next);
    };

    void load();
  }, []);

  const modules: Array<{ key: ModuleKey; label: string; note: string }> = [
    { key: "gate", label: "Gate", note: "Visitor entry and exit monitoring workflow." },
    { key: "invitations", label: "Invitations", note: "Approve/reject resident invitations." },
    { key: "bookings", label: "Space Bookings", note: "Reservation review and conflict control." },
    { key: "notices", label: "Notices", note: "Draft, schedule, publish and archive notices." },
    { key: "market", label: "Market", note: "Moderate listings and approve products." },
    { key: "users", label: "Users", note: "User lifecycle and role governance." },
    { key: "apartments", label: "Apartments", note: "Unit inventory and occupancy mapping." }
  ];

  return (
    <PageContainer title="Dashboard" subtitle="Resident Management SaaS control center.">
      <div className="bo-grid bo-grid-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} title={kpi.title}>
            <p className="bo-kpi">{kpi.value}</p>
          </Card>
        ))}
      </div>
      <Card title="Module Coverage">
        <div className="bo-kv-grid">
          {modules.map((module) => (
            <div key={module.key} className="bo-kv-item">
              <span className="bo-kv-key">{module.label}</span>
              <span className="bo-kv-value">{module.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
