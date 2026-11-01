import { http } from "./http";
import type { DashboardData } from "@/types";

export function getDashboard() {
  return http.get<DashboardData>("/dashboard");
}
