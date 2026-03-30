export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Resident" | "Manager";
  status: "Active" | "Pending" | "Suspended";
};

export const mockUsers: UserRecord[] = [
  { id: "U-1001", name: "Andrea Gomes", email: "andrea@planet.app", role: "Resident", status: "Active" },
  { id: "U-1002", name: "Rahul Sharma", email: "rahul@planet.app", role: "Manager", status: "Active" },
  { id: "U-1003", name: "Sara Martin", email: "sara@planet.app", role: "Resident", status: "Pending" },
  { id: "U-1004", name: "Neha Kulkarni", email: "neha@planet.app", role: "Admin", status: "Active" },
  { id: "U-1005", name: "Amit Patil", email: "amit@planet.app", role: "Resident", status: "Suspended" }
];
