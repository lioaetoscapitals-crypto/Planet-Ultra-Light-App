import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ROUTES } from "../../../utils/constants";
import { usersService } from "../../../services/api";

type DocumentRow = {
  id: string;
  type: string;
  status: string;
  fileUrl: string;
  uploadedAt: string;
};

type RequiredDocument = {
  type: string;
  uploaded: boolean;
  status: string;
  fileUrl?: string;
};

type UserDetail = {
  id: string;
  name: string;
  apartment: string;
  role: string;
  status: string;
  phone: string;
  societyId: string;
  requiredDocuments?: RequiredDocument[];
  documents?: DocumentRow[];
};

function prettyDocumentLabel(type: string) {
  const labels: Record<string, string> = {
    sale_deed: "Sale Deed Copy",
    index_2: "Index 2",
    govt_id: "Government ID",
    rent_agreement: "Leave & License Copy",
    police_verification: "Police Verification Copy",
    society_charge_receipt: "Society Charge Receipt",
    reference_owner_id: "Owner Reference ID",
  };
  return labels[type] ?? type;
}

export default function UsersDetailScreen() {
  const { id = "" } = useParams();
  const [item, setItem] = useState<UserDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    void usersService.getById(id).then((data) => setItem(data as UserDetail));
  }, [id]);

  return (
    <PageContainer title="User Detail" showHeader={false}>
      <Card>
        <div className="bo-inline-actions">
          <Link to={ROUTES.users} className="bo-link-reset">
            <Button variant="secondary">Back</Button>
          </Link>
          <Link to={`${ROUTES.users}/${id}/edit`} className="bo-link-reset">
            <Button>Edit User</Button>
          </Link>
        </div>
      </Card>

      <Card title="User Overview">
        {!item ? <p>Loading user detail...</p> : null}
        {item ? (
          <div className="bo-kv-grid">
            <div className="bo-kv-item"><span className="bo-kv-key">Name</span><span className="bo-kv-value">{item.name}</span></div>
            <div className="bo-kv-item"><span className="bo-kv-key">Apartment</span><span className="bo-kv-value">{item.apartment}</span></div>
            <div className="bo-kv-item"><span className="bo-kv-key">Role</span><span className="bo-kv-value">{item.role}</span></div>
            <div className="bo-kv-item"><span className="bo-kv-key">Status</span><span className="bo-kv-value">{item.status}</span></div>
            <div className="bo-kv-item"><span className="bo-kv-key">Phone</span><span className="bo-kv-value">{item.phone}</span></div>
            <div className="bo-kv-item"><span className="bo-kv-key">Society ID</span><span className="bo-kv-value">{item.societyId}</span></div>
          </div>
        ) : null}
      </Card>

      <Card title="Required Document Checklist">
        {!item ? null : (
          <div className="bo-kv-grid">
            {(item.requiredDocuments ?? []).map((doc) => (
              <div key={doc.type} className="bo-kv-item">
                <span className="bo-kv-key">{prettyDocumentLabel(doc.type)}</span>
                <span className="bo-kv-value">
                  {doc.uploaded ? `Uploaded (${doc.status})` : "Missing"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Uploaded Documents">
        {!item ? null : (
          <div className="bo-kv-grid">
            {(item.documents ?? []).map((doc) => (
              <div key={doc.id} className="bo-kv-item">
                <span className="bo-kv-key">{prettyDocumentLabel(doc.type)} [{doc.status}]</span>
                <a className="bo-kv-value" href={doc.fileUrl} target="_blank" rel="noreferrer">
                  Open Document
                </a>
              </div>
            ))}
            {(item.documents ?? []).length === 0 ? <p>No documents uploaded.</p> : null}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
