import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageContainer from "../../components/common/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import type { ModuleKey } from "../../services/api/types";
import { moduleRegistry } from "./moduleRegistry";

type Props = {
  moduleKey: ModuleKey;
  baseRoute: string;
};

export default function ModuleDetailPage({ moduleKey, baseRoute }: Props) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const config = moduleRegistry[moduleKey];
  const [item, setItem] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!id) return;
    void config.service.getById(id).then(setItem);
  }, [config.service, id]);

  const runAction = async (action: "approve" | "reject") => {
    if (!id) return;
    const serviceAction = config.service[action];
    if (!serviceAction) return;
    await serviceAction(id);
    const refreshed = await config.service.getById(id);
    setItem(refreshed);
  };

  return (
    <PageContainer title={`${config.singularLabel} Detail`} subtitle={`ID: ${id}`}>
      <Card>
        <div className="bo-inline-actions">
          <Link to={baseRoute} className="bo-link-reset">
            <Button variant="secondary">Back</Button>
          </Link>
          <Link to={`${baseRoute}/${id}/edit`} className="bo-link-reset">
            <Button>Edit</Button>
          </Link>
          {config.workflowActions?.includes("approve") ? (
            <Button variant="secondary" onClick={() => void runAction("approve")}>
              Approve
            </Button>
          ) : null}
          {config.workflowActions?.includes("reject") ? (
            <Button variant="ghost" onClick={() => void runAction("reject")}>
              Reject
            </Button>
          ) : null}
        </div>
      </Card>

      <Card title="Entity Data">
        {!item ? <p>Record not found.</p> : null}
        {item ? (
          <div className="bo-kv-grid">
            {config.detailFields.map((key) => (
              <div key={key} className="bo-kv-item">
                <span className="bo-kv-key">{key}</span>
                <span className="bo-kv-value">{String(item[key] ?? "-")}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card>
        <Button variant="secondary" onClick={() => navigate(baseRoute)}>
          Close Detail
        </Button>
      </Card>
    </PageContainer>
  );
}
