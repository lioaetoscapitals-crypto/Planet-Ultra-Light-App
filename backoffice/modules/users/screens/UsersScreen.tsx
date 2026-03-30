import { useEffect, useMemo, useState } from "react";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";
import Table from "../../../components/ui/Table";
import { listUsers } from "../../../services/api/userService";
import type { UserRecord } from "../../../assets/mock/users";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function UsersScreen() {
  const [users, setUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    void listUsers().then(setUsers);
  }, []);

  const rows = useMemo<UserRow[]>(
    () =>
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      })),
    [users]
  );

  return (
    <PageContainer title="Users" subtitle="Resident and role management foundation module.">
      <Card title="Users List" subtitle="Starter table structure with mock data from service layer">
        <Table
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" }
          ]}
          rows={rows}
        />
      </Card>
    </PageContainer>
  );
}
