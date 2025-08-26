export type Role = "COMPANIES" | "AGENT" | "CASHIER" | "ADMIN" | "SUPERADMIN";

export const RoleLabels: Record<Role, string> = {
  COMPANIES: "Company",
  AGENT: "Agent",
  CASHIER: "Cashier",
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
};
