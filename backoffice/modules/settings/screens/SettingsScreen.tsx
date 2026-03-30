import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/ui/Card";
import SettingsForm from "../../../components/forms/SettingsForm";

export default function SettingsScreen() {
  return (
    <PageContainer title="Settings" subtitle="Tenant-level SaaS controls and configuration forms.">
      <Card title="Platform Settings" subtitle="Basic settings form starter with validation behavior">
        <SettingsForm />
      </Card>
    </PageContainer>
  );
}
