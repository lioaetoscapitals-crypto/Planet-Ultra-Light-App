import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { isRequired } from "../../utils/validators";

type SettingsValues = {
  tenantName: string;
  supportEmail: string;
  timezone: string;
};

export default function SettingsForm() {
  const [values, setValues] = useState<SettingsValues>({
    tenantName: "Planet App Operations",
    supportEmail: "support@planet.app",
    timezone: "Asia/Kolkata"
  });
  const [statusMessage, setStatusMessage] = useState("");

  const updateValue = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isRequired(values.tenantName) || !isRequired(values.supportEmail) || !isRequired(values.timezone)) {
      setStatusMessage("All fields are required.");
      return;
    }
    setStatusMessage("Settings saved successfully.");
  };

  return (
    <form className="bo-form" onSubmit={handleSubmit}>
      <Input
        label="Tenant Name"
        value={values.tenantName}
        onChange={(value) => updateValue("tenantName", value)}
      />
      <Input
        label="Support Email"
        value={values.supportEmail}
        onChange={(value) => updateValue("supportEmail", value)}
        type="email"
      />
      <Input
        label="Default Timezone"
        value={values.timezone}
        onChange={(value) => updateValue("timezone", value)}
      />
      {statusMessage ? <p className="bo-form-status">{statusMessage}</p> : null}
      <Button type="submit">Save Settings</Button>
    </form>
  );
}
