import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the api module
vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import after mocking
import { api } from "./api";
import {
  getVaults,
  getVault,
  createVault,
  updateVault,
  deleteVault,
  getVaultUserGrants,
  createVaultUserGrant,
  updateVaultUserGrant,
  deleteVaultUserGrant,
  getVaultTeamGrants,
  createVaultTeamGrant,
  updateVaultTeamGrant,
  deleteVaultTeamGrant,
} from "./vaults";

describe("vaults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVaults", () => {
    it("returns list of vaults for an organization", async () => {
      const mockVaults = [
        { id: "vault1", name: "Vault 1" },
        { id: "vault2", name: "Vault 2" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockVaults });

      const result = await getVaults("org1");

      expect(api.get).toHaveBeenCalledWith("/v1/organizations/org1/vaults");
      expect(result).toEqual(mockVaults);
    });
  });

  describe("getVault", () => {
    it("returns a specific vault", async () => {
      const mockVault = { id: "vault1", name: "Vault 1" };
      vi.mocked(api.get).mockResolvedValueOnce(mockVault);

      const result = await getVault("org1", "vault1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1"
      );
      expect(result).toEqual(mockVault);
    });
  });

  describe("createVault", () => {
    it("creates a new vault with description", async () => {
      const mockVault = {
        id: "vault1",
        name: "New Vault",
        description: "A vault",
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockVault);

      const result = await createVault("org1", {
        name: "New Vault",
        description: "A vault",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations/org1/vaults", {
        name: "New Vault",
        description: "A vault",
      });
      expect(result).toEqual(mockVault);
    });

    it("creates a vault without description", async () => {
      const mockVault = { id: "vault1", name: "New Vault" };
      vi.mocked(api.post).mockResolvedValueOnce(mockVault);

      const result = await createVault("org1", { name: "New Vault" });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations/org1/vaults", {
        name: "New Vault",
      });
      expect(result).toEqual(mockVault);
    });
  });

  describe("updateVault", () => {
    it("updates a vault", async () => {
      const mockVault = { id: "vault1", name: "Updated Vault" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockVault);

      const result = await updateVault("org1", "vault1", {
        name: "Updated Vault",
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1",
        { name: "Updated Vault" }
      );
      expect(result).toEqual(mockVault);
    });
  });

  describe("deleteVault", () => {
    it("deletes a vault", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await deleteVault("org1", "vault1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1"
      );
    });
  });

  // User Grants
  describe("getVaultUserGrants", () => {
    it("returns list of user grants", async () => {
      const mockGrants = [
        { id: "grant1", user_id: "user1", role: "admin" },
        { id: "grant2", user_id: "user2", role: "reader" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockGrants });

      const result = await getVaultUserGrants("org1", "vault1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/user-grants"
      );
      expect(result).toEqual(mockGrants);
    });
  });

  describe("createVaultUserGrant", () => {
    it("creates a user grant", async () => {
      const mockGrant = { id: "grant1", user_id: "user1", role: "admin" };
      vi.mocked(api.post).mockResolvedValueOnce(mockGrant);

      const result = await createVaultUserGrant("org1", "vault1", {
        user_id: "user1",
        role: "admin",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/user-grants",
        { user_id: "user1", role: "admin" }
      );
      expect(result).toEqual(mockGrant);
    });
  });

  describe("updateVaultUserGrant", () => {
    it("updates a user grant role", async () => {
      const mockGrant = { id: "grant1", user_id: "user1", role: "writer" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockGrant);

      const result = await updateVaultUserGrant("org1", "vault1", "grant1", {
        role: "writer",
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/user-grants/grant1",
        { role: "writer" }
      );
      expect(result).toEqual(mockGrant);
    });
  });

  describe("deleteVaultUserGrant", () => {
    it("deletes a user grant", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await deleteVaultUserGrant("org1", "vault1", "grant1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/user-grants/grant1"
      );
    });
  });

  // Team Grants
  describe("getVaultTeamGrants", () => {
    it("returns list of team grants", async () => {
      const mockGrants = [
        { id: "grant1", team_id: "team1", role: "admin" },
        { id: "grant2", team_id: "team2", role: "reader" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockGrants });

      const result = await getVaultTeamGrants("org1", "vault1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/team-grants"
      );
      expect(result).toEqual(mockGrants);
    });
  });

  describe("createVaultTeamGrant", () => {
    it("creates a team grant", async () => {
      const mockGrant = { id: "grant1", team_id: "team1", role: "admin" };
      vi.mocked(api.post).mockResolvedValueOnce(mockGrant);

      const result = await createVaultTeamGrant("org1", "vault1", {
        team_id: "team1",
        role: "admin",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/team-grants",
        { team_id: "team1", role: "admin" }
      );
      expect(result).toEqual(mockGrant);
    });
  });

  describe("updateVaultTeamGrant", () => {
    it("updates a team grant role", async () => {
      const mockGrant = { id: "grant1", team_id: "team1", role: "writer" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockGrant);

      const result = await updateVaultTeamGrant("org1", "vault1", "grant1", {
        role: "writer",
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/team-grants/grant1",
        { role: "writer" }
      );
      expect(result).toEqual(mockGrant);
    });
  });

  describe("deleteVaultTeamGrant", () => {
    it("deletes a team grant", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await deleteVaultTeamGrant("org1", "vault1", "grant1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/vaults/vault1/team-grants/grant1"
      );
    });
  });
});
