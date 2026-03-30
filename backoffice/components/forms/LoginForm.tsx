import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useAuth from "../../hooks/useAuth";
import useForm from "../../hooks/useForm";
import { isRequired, isValidEmail, minLength } from "../../utils/validators";

type LoginValues = {
  email: string;
  password: string;
};

const initialValues: LoginValues = {
  email: "",
  password: ""
};

function validate(values: LoginValues) {
  const errors: Partial<Record<keyof LoginValues, string>> = {};

  if (!isRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email";
  }

  if (!isRequired(values.password)) {
    errors.password = "Password is required";
  } else if (!minLength(values.password, 8)) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

export default function LoginForm() {
  const { login, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const { values, errors, setValue, runValidation } = useForm(initialValues, validate);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);

    if (!runValidation()) {
      return;
    }

    try {
      await login(values.email, values.password);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to login");
    }
  };

  return (
    <form className="bo-form" onSubmit={(event) => void handleSubmit(event)}>
      <Input
        label="Work Email"
        value={values.email}
        onChange={(value) => setValue("email", value)}
        type="email"
        placeholder="admin@planet.app"
        error={errors.email}
      />
      <Input
        label="Password"
        value={values.password}
        onChange={(value) => setValue("password", value)}
        type="password"
        placeholder="Enter secure password"
        error={errors.password}
      />
      {serverError ? <p className="bo-form-error">{serverError}</p> : null}
      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="bo-form-hint">Demo credentials: admin@planet.app / Planet@123</p>
    </form>
  );
}
