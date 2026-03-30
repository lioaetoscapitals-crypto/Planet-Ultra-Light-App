import { useState } from "react";

type Validator<T> = (values: T) => Partial<Record<keyof T, string>>;

export default function useForm<T extends Record<string, string>>(
  initialValues: T,
  validate: Validator<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const runValidation = () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return {
    values,
    errors,
    setValue,
    setErrors,
    runValidation
  };
}
