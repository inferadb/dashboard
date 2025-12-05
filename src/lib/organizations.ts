import { api, type PaginatedResponse } from "./api";
import type {
  Organization,
  OrgMember,
  OrgInvitation,
} from "@/types/api";

// Organization CRUD
export async function getOrganizations(): Promise<Organization[]> {
  const response = await api.get<PaginatedResponse<Organization>>(
    "/v1/organizations"
  );
  return response.data;
}

export async function getOrganization(orgId: string): Promise<Organization> {
  return api.get<Organization>(`/v1/organizations/${orgId}`);
}

export async function createOrganization(data: {
  name: string;
  slug: string;
}): Promise<Organization> {
  return api.post<Organization>("/v1/organizations", data);
}

export async function updateOrganization(
  orgId: string,
  data: { name?: string; slug?: string }
): Promise<Organization> {
  return api.patch<Organization>(`/v1/organizations/${orgId}`, data);
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await api.delete(`/v1/organizations/${orgId}`);
}

// Members
export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const response = await api.get<PaginatedResponse<OrgMember>>(
    `/v1/organizations/${orgId}/members`
  );
  return response.data;
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: "admin" | "member"
): Promise<OrgMember> {
  return api.patch<OrgMember>(
    `/v1/organizations/${orgId}/members/${userId}`,
    { role }
  );
}

export async function removeMember(
  orgId: string,
  userId: string
): Promise<void> {
  await api.delete(`/v1/organizations/${orgId}/members/${userId}`);
}

// Invitations
export async function getOrgInvitations(
  orgId: string
): Promise<OrgInvitation[]> {
  const response = await api.get<PaginatedResponse<OrgInvitation>>(
    `/v1/organizations/${orgId}/invitations`
  );
  return response.data;
}

export async function inviteMember(
  orgId: string,
  data: { email: string; role: "admin" | "member" }
): Promise<OrgInvitation> {
  return api.post<OrgInvitation>(
    `/v1/organizations/${orgId}/invitations`,
    data
  );
}

export async function cancelInvitation(
  orgId: string,
  invitationId: string
): Promise<void> {
  await api.delete(
    `/v1/organizations/${orgId}/invitations/${invitationId}`
  );
}
