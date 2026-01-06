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
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrgMembers,
  updateMemberRole,
  removeMember,
  getOrgInvitations,
  inviteMember,
  cancelInvitation,
} from "./organizations";

describe("organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrganizations", () => {
    it("returns list of organizations", async () => {
      const mockOrgs = [
        { id: "org1", name: "Org 1", slug: "org-1" },
        { id: "org2", name: "Org 2", slug: "org-2" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockOrgs });

      const result = await getOrganizations();

      expect(api.get).toHaveBeenCalledWith("/v1/organizations");
      expect(result).toEqual(mockOrgs);
    });
  });

  describe("getOrganization", () => {
    it("returns a specific organization", async () => {
      const mockOrg = { id: "org1", name: "Org 1", slug: "org-1" };
      vi.mocked(api.get).mockResolvedValueOnce(mockOrg);

      const result = await getOrganization("org1");

      expect(api.get).toHaveBeenCalledWith("/v1/organizations/org1");
      expect(result).toEqual(mockOrg);
    });
  });

  describe("createOrganization", () => {
    it("creates a new organization", async () => {
      const mockOrg = { id: "org1", name: "New Org", slug: "new-org" };
      vi.mocked(api.post).mockResolvedValueOnce(mockOrg);

      const result = await createOrganization({
        name: "New Org",
        slug: "new-org",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations", {
        name: "New Org",
        slug: "new-org",
      });
      expect(result).toEqual(mockOrg);
    });
  });

  describe("updateOrganization", () => {
    it("updates an organization", async () => {
      const mockOrg = { id: "org1", name: "Updated Org", slug: "updated-org" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockOrg);

      const result = await updateOrganization("org1", { name: "Updated Org" });

      expect(api.patch).toHaveBeenCalledWith("/v1/organizations/org1", {
        name: "Updated Org",
      });
      expect(result).toEqual(mockOrg);
    });
  });

  describe("deleteOrganization", () => {
    it("deletes an organization", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await deleteOrganization("org1");

      expect(api.delete).toHaveBeenCalledWith("/v1/organizations/org1");
    });
  });

  describe("getOrgMembers", () => {
    it("returns list of organization members", async () => {
      const mockMembers = [
        { user_id: "user1", role: "admin" },
        { user_id: "user2", role: "member" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMembers });

      const result = await getOrgMembers("org1");

      expect(api.get).toHaveBeenCalledWith("/v1/organizations/org1/members");
      expect(result).toEqual(mockMembers);
    });
  });

  describe("updateMemberRole", () => {
    it("updates a member role", async () => {
      const mockMember = { user_id: "user1", role: "admin" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockMember);

      const result = await updateMemberRole("org1", "user1", "admin");

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/members/user1",
        { role: "admin" }
      );
      expect(result).toEqual(mockMember);
    });
  });

  describe("removeMember", () => {
    it("removes a member from organization", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await removeMember("org1", "user1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/members/user1"
      );
    });
  });

  describe("getOrgInvitations", () => {
    it("returns list of invitations", async () => {
      const mockInvitations = [
        { id: "inv1", email: "test1@example.com", role: "member" },
        { id: "inv2", email: "test2@example.com", role: "admin" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockInvitations });

      const result = await getOrgInvitations("org1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/invitations"
      );
      expect(result).toEqual(mockInvitations);
    });
  });

  describe("inviteMember", () => {
    it("creates a new invitation", async () => {
      const mockInvitation = {
        id: "inv1",
        email: "newuser@example.com",
        role: "member",
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockInvitation);

      const result = await inviteMember("org1", {
        email: "newuser@example.com",
        role: "member",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/invitations",
        {
          email: "newuser@example.com",
          role: "member",
        }
      );
      expect(result).toEqual(mockInvitation);
    });
  });

  describe("cancelInvitation", () => {
    it("cancels an invitation", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await cancelInvitation("org1", "inv1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/invitations/inv1"
      );
    });
  });
});
