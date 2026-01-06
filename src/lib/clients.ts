import { api, type PaginatedResponse } from "./api";
import type {
  Client,
  ClientCertificate,
  CreateCertificateResponse,
} from "@/types/api";

// Client CRUD
export async function getClients(orgId: string): Promise<Client[]> {
  const response = await api.get<PaginatedResponse<Client>>(
    `/v1/organizations/${orgId}/clients`
  );
  return response.data;
}

export async function getClient(
  orgId: string,
  clientId: string
): Promise<Client> {
  return api.get<Client>(`/v1/organizations/${orgId}/clients/${clientId}`);
}

export async function createClient(
  orgId: string,
  data: { name: string; description?: string }
): Promise<Client> {
  return api.post<Client>(`/v1/organizations/${orgId}/clients`, data);
}

export async function updateClient(
  orgId: string,
  clientId: string,
  data: { name: string }
): Promise<Client> {
  return api.patch<Client>(
    `/v1/organizations/${orgId}/clients/${clientId}`,
    data
  );
}

export async function deleteClient(
  orgId: string,
  clientId: string
): Promise<void> {
  await api.delete(`/v1/organizations/${orgId}/clients/${clientId}`);
}

export async function deactivateClient(
  orgId: string,
  clientId: string
): Promise<void> {
  await api.post(`/v1/organizations/${orgId}/clients/${clientId}/deactivate`);
}

export async function activateClient(
  orgId: string,
  clientId: string
): Promise<void> {
  await api.post(`/v1/organizations/${orgId}/clients/${clientId}/activate`);
}

// Certificates
export async function getCertificates(
  orgId: string,
  clientId: string
): Promise<ClientCertificate[]> {
  const response = await api.get<PaginatedResponse<ClientCertificate>>(
    `/v1/organizations/${orgId}/clients/${clientId}/certificates`
  );
  return response.data;
}

export async function createCertificate(
  orgId: string,
  clientId: string,
  data: { name: string }
): Promise<CreateCertificateResponse> {
  return api.post<CreateCertificateResponse>(
    `/v1/organizations/${orgId}/clients/${clientId}/certificates`,
    data
  );
}

export async function revokeCertificate(
  orgId: string,
  clientId: string,
  certId: string
): Promise<void> {
  await api.post(
    `/v1/organizations/${orgId}/clients/${clientId}/certificates/${certId}/revoke`
  );
}
