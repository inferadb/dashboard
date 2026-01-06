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
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from "./teams";

describe("teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTeams", () => {
    it("returns list of teams for an organization", async () => {
      const mockTeams = [
        { id: "team1", name: "Team 1" },
        { id: "team2", name: "Team 2" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeams });

      const result = await getTeams("org1");

      expect(api.get).toHaveBeenCalledWith("/v1/organizations/org1/teams");
      expect(result).toEqual(mockTeams);
    });
  });

  describe("getTeam", () => {
    it("returns a specific team", async () => {
      const mockTeam = { id: "team1", name: "Team 1" };
      vi.mocked(api.get).mockResolvedValueOnce(mockTeam);

      const result = await getTeam("org1", "team1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1"
      );
      expect(result).toEqual(mockTeam);
    });
  });

  describe("createTeam", () => {
    it("creates a new team", async () => {
      const mockTeam = {
        id: "team1",
        name: "New Team",
        description: "A new team",
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockTeam);

      const result = await createTeam("org1", {
        name: "New Team",
        description: "A new team",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations/org1/teams", {
        name: "New Team",
        description: "A new team",
      });
      expect(result).toEqual(mockTeam);
    });

    it("creates a team without description", async () => {
      const mockTeam = { id: "team1", name: "New Team" };
      vi.mocked(api.post).mockResolvedValueOnce(mockTeam);

      const result = await createTeam("org1", { name: "New Team" });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations/org1/teams", {
        name: "New Team",
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe("updateTeam", () => {
    it("updates a team", async () => {
      const mockTeam = { id: "team1", name: "Updated Team" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockTeam);

      const result = await updateTeam("org1", "team1", {
        name: "Updated Team",
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1",
        {
          name: "Updated Team",
        }
      );
      expect(result).toEqual(mockTeam);
    });
  });

  describe("deleteTeam", () => {
    it("deletes a team", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await deleteTeam("org1", "team1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1"
      );
    });
  });

  describe("getTeamMembers", () => {
    it("returns list of team members", async () => {
      const mockMembers = [
        { user_id: "user1", is_manager: true },
        { user_id: "user2", is_manager: false },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMembers });

      const result = await getTeamMembers("org1", "team1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1/members"
      );
      expect(result).toEqual(mockMembers);
    });
  });

  describe("addTeamMember", () => {
    it("adds a member to a team", async () => {
      const mockMember = { user_id: "user1", is_manager: false };
      vi.mocked(api.post).mockResolvedValueOnce(mockMember);

      const result = await addTeamMember("org1", "team1", {
        user_id: "user1",
        is_manager: false,
      });

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1/members",
        { user_id: "user1", is_manager: false }
      );
      expect(result).toEqual(mockMember);
    });

    it("adds a manager to a team", async () => {
      const mockMember = { user_id: "user1", is_manager: true };
      vi.mocked(api.post).mockResolvedValueOnce(mockMember);

      const result = await addTeamMember("org1", "team1", {
        user_id: "user1",
        is_manager: true,
      });

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1/members",
        { user_id: "user1", is_manager: true }
      );
      expect(result).toEqual(mockMember);
    });
  });

  describe("updateTeamMember", () => {
    it("updates a team member to manager", async () => {
      const mockMember = { user_id: "user1", is_manager: true };
      vi.mocked(api.patch).mockResolvedValueOnce(mockMember);

      const result = await updateTeamMember("org1", "team1", "user1", {
        manager: true,
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1/members/user1",
        { manager: true }
      );
      expect(result).toEqual(mockMember);
    });

    it("demotes a team member from manager", async () => {
      const mockMember = { user_id: "user1", is_manager: false };
      vi.mocked(api.patch).mockResolvedValueOnce(mockMember);

      const result = await updateTeamMember("org1", "team1", "user1", {
        manager: false,
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1/members/user1",
        { manager: false }
      );
      expect(result).toEqual(mockMember);
    });
  });

  describe("removeTeamMember", () => {
    it("removes a member from a team", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await removeTeamMember("org1", "team1", "user1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/teams/team1/members/user1"
      );
    });
  });
});
