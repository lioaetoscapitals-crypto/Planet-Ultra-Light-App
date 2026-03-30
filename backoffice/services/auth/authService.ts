type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin";
};

const VALID_CREDENTIALS = {
  email: "admin@planet.app",
  password: "Planet@123"
};

export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (
    payload.email.trim().toLowerCase() !== VALID_CREDENTIALS.email ||
    payload.password !== VALID_CREDENTIALS.password
  ) {
    throw new Error("Invalid credentials. Use admin@planet.app / Planet@123");
  }

  return {
    token: "planet-backoffice-token",
    user: {
      id: "ADMIN-001",
      name: "Planet Super Admin",
      email: VALID_CREDENTIALS.email,
      role: "Super Admin"
    }
  };
}

export async function logout() {
  await new Promise((resolve) => setTimeout(resolve, 100));
}
