import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageContainer from "../../components/common/PageContainer";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import type { ModuleKey } from "../../services/api/types";
import { moduleRegistry } from "./moduleRegistry";
import { getSelectedSocietyId } from "../../services/societySelection";

type Props = {
  moduleKey: ModuleKey;
  baseRoute: string;
};

export default function ModuleFormPage({ moduleKey, baseRoute }: Props) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const config = moduleRegistry[moduleKey];
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const title = useMemo(
    () => (isEdit ? `Edit ${config.singularLabel}` : `Create ${config.singularLabel}`),
    [config.singularLabel, isEdit]
  );

  useEffect(() => {
    const initial: Record<string, string> = {};
    config.formFields.forEach((field) => {
      initial[field.key] = "";
    });
    const selectedSocietyId = getSelectedSocietyId();
    if (selectedSocietyId && Object.prototype.hasOwnProperty.call(initial, "societyId")) {
      initial.societyId = selectedSocietyId;
    }
    setFormValues(initial);
  }, [config.formFields]);

  useEffect(() => {
    if (!isEdit || !id) return;
    void config.service.getById(id).then((entity) => {
      if (!entity) return;
      const next: Record<string, string> = {};
      config.formFields.forEach((field) => {
        next[field.key] = String(entity[field.key] ?? "");
      });
      setFormValues(next);
    });
  }, [config.formFields, config.service, id, isEdit]);

  const setFieldValue = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const requiredFields = config.formFields.filter((field) => field.key !== "towerScope" && field.key !== "publishAt");
    const isInvalid = requiredFields.some((field) => !String(formValues[field.key] ?? "").trim());
    if (isInvalid) {
      setError("Please fill all required fields.");
      return;
    }

    if (isEdit && id) {
      await config.service.update(id, formValues);
      navigate(`${baseRoute}/${id}`);
      return;
    }

    const created = await config.service.create(formValues);
    navigate(`${baseRoute}/${String(created.id)}`);
  };

  return (
    <PageContainer title={title} subtitle={`${config.label} form workflow`}>
      <Card>
        <form className="bo-form" onSubmit={(event) => void handleSave(event)}>
          {config.formFields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              value={formValues[field.key] ?? ""}
              onChange={(value) => setFieldValue(field.key, value)}
              placeholder={field.placeholder}
            />
          ))}
          {error ? <p className="bo-form-error">{error}</p> : null}
          <div className="bo-inline-actions">
            <Button type="submit">{isEdit ? "Save Changes" : "Create"}</Button>
            <Link to={baseRoute} className="bo-link-reset">
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
