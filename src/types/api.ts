// User types
export interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Organization types
export type OrgRole = "owner" | "admin" | "member";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  suspended_at: string | null;
}

export interface OrgMember {
  user_id: string;
  org_id: string;
  role: OrgRole;
  created_at: string;
  user: User;
}

export interface OrgInvitation {
  id: string;
  org_id: string;
  email: string;
  role: OrgRole;
  created_at: string;
  expires_at: string;
}

// Team types
export interface Team {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  is_manager: boolean;
  created_at: string;
  user: User;
}

// Vault types
export type VaultRole = "admin" | "manager" | "writer" | "reader";
export type VaultSyncStatus = "pending" | "synced" | "sync_failed";

export interface Vault {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  sync_status: VaultSyncStatus;
  created_at: string;
  updated_at: string;
  suspended_at: string | null;
}

export interface VaultUserGrant {
  id: string;
  vault_id: string;
  user_id: string;
  role: VaultRole;
  created_at: string;
  user: User;
}

export interface VaultTeamGrant {
  id: string;
  vault_id: string;
  team_id: string;
  role: VaultRole;
  created_at: string;
  team: Team;
}

// Client types
export interface Client {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCertificate {
  id: string;
  client_id: string;
  kid: string;
  name: string;
  public_key: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCertificateResponse {
  certificate: ClientCertificate;
  private_key: string;
}

// Session types
export interface Session {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_active_at: string;
  expires_at: string;
  current: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  session_id: string;
}
