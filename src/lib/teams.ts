import { api, type PaginatedResponse } from "./api";
import type { Team, TeamMember } from "@/types/api";

// Team CRUD
export async function getTeams(orgId: string): Promise<Team[]> {
  const response = await api.get<PaginatedResponse<Team>>(
    `/v1/organizations/${orgId}/teams`
  );
  return response.data;
}

export async function getTeam(orgId: string, teamId: string): Promise<Team> {
  return api.get<Team>(`/v1/organizations/${orgId}/teams/${teamId}`);
}

export async function createTeam(
  orgId: string,
  data: { name: string; description?: string }
): Promise<Team> {
  return api.post<Team>(`/v1/organizations/${orgId}/teams`, data);
}

export async function updateTeam(
  orgId: string,
  teamId: string,
  data: { name: string }
): Promise<Team> {
  return api.patch<Team>(`/v1/organizations/${orgId}/teams/${teamId}`, data);
}

export async function deleteTeam(orgId: string, teamId: string): Promise<void> {
  await api.delete(`/v1/organizations/${orgId}/teams/${teamId}`);
}

// Team Members
export async function getTeamMembers(
  orgId: string,
  teamId: string
): Promise<TeamMember[]> {
  const response = await api.get<PaginatedResponse<TeamMember>>(
    `/v1/organizations/${orgId}/teams/${teamId}/members`
  );
  return response.data;
}

export async function addTeamMember(
  orgId: string,
  teamId: string,
  data: { user_id: string; is_manager: boolean }
): Promise<TeamMember> {
  return api.post<TeamMember>(
    `/v1/organizations/${orgId}/teams/${teamId}/members`,
    data
  );
}

export async function updateTeamMember(
  orgId: string,
  teamId: string,
  userId: string,
  data: { manager: boolean }
): Promise<TeamMember> {
  return api.patch<TeamMember>(
    `/v1/organizations/${orgId}/teams/${teamId}/members/${userId}`,
    data
  );
}

export async function removeTeamMember(
  orgId: string,
  teamId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `/v1/organizations/${orgId}/teams/${teamId}/members/${userId}`
  );
}
