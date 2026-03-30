import { mockUsers, type UserRecord } from "../../assets/mock/users";

export async function listUsers(): Promise<UserRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockUsers;
}
