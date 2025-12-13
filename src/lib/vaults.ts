import { api, type PaginatedResponse } from "./api";
import type { Vault, VaultUserGrant, VaultTeamGrant, VaultRole } from "@/types/api";

// Vault CRUD
export async function getVaults(orgId: string): Promise<Vault[]> {
  const response = await api.get<PaginatedResponse<Vault>>(
    `/v1/organizations/${orgId}/vaults`
  );
  return response.data;
}

export async function getVault(orgId: string, vaultId: string): Promise<Vault> {
  return api.get<Vault>(`/v1/organizations/${orgId}/vaults/${vaultId}`);
}

export async function createVault(
  orgId: string,
  data: { name: string; description?: string }
): Promise<Vault> {
  return api.post<Vault>(`/v1/organizations/${orgId}/vaults`, data);
}

export async function updateVault(
  orgId: string,
  vaultId: string,
  data: { name: string; description?: string }
): Promise<Vault> {
  return api.patch<Vault>(
    `/v1/organizations/${orgId}/vaults/${vaultId}`,
    data
  );
}

export async function deleteVault(
  orgId: string,
  vaultId: string
): Promise<void> {
  await api.delete(`/v1/organizations/${orgId}/vaults/${vaultId}`);
}

// User Grants
export async function getVaultUserGrants(
  orgId: string,
  vaultId: string
): Promise<VaultUserGrant[]> {
  const response = await api.get<PaginatedResponse<VaultUserGrant>>(
    `/v1/organizations/${orgId}/vaults/${vaultId}/user-grants`
  );
  return response.data;
}

export async function createVaultUserGrant(
  orgId: string,
  vaultId: string,
  data: { user_id: string; role: VaultRole }
): Promise<VaultUserGrant> {
  return api.post<VaultUserGrant>(
    `/v1/organizations/${orgId}/vaults/${vaultId}/user-grants`,
    data
  );
}

export async function updateVaultUserGrant(
  orgId: string,
  vaultId: string,
  grantId: string,
  data: { role: VaultRole }
): Promise<VaultUserGrant> {
  return api.patch<VaultUserGrant>(
    `/v1/organizations/${orgId}/vaults/${vaultId}/user-grants/${grantId}`,
    data
  );
}

export async function deleteVaultUserGrant(
  orgId: string,
  vaultId: string,
  grantId: string
): Promise<void> {
  await api.delete(
    `/v1/organizations/${orgId}/vaults/${vaultId}/user-grants/${grantId}`
  );
}

// Team Grants
export async function getVaultTeamGrants(
  orgId: string,
  vaultId: string
): Promise<VaultTeamGrant[]> {
  const response = await api.get<PaginatedResponse<VaultTeamGrant>>(
    `/v1/organizations/${orgId}/vaults/${vaultId}/team-grants`
  );
  return response.data;
}

export async function createVaultTeamGrant(
  orgId: string,
  vaultId: string,
  data: { team_id: string; role: VaultRole }
): Promise<VaultTeamGrant> {
  return api.post<VaultTeamGrant>(
    `/v1/organizations/${orgId}/vaults/${vaultId}/team-grants`,
    data
  );
}

export async function updateVaultTeamGrant(
  orgId: string,
  vaultId: string,
  grantId: string,
  data: { role: VaultRole }
): Promise<VaultTeamGrant> {
  return api.patch<VaultTeamGrant>(
    `/v1/organizations/${orgId}/vaults/${vaultId}/team-grants/${grantId}`,
    data
  );
}

export async function deleteVaultTeamGrant(
  orgId: string,
  vaultId: string,
  grantId: string
): Promise<void> {
  await api.delete(
    `/v1/organizations/${orgId}/vaults/${vaultId}/team-grants/${grantId}`
  );
}
