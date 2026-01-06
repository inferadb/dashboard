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
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  deactivateClient,
  activateClient,
  getCertificates,
  createCertificate,
  revokeCertificate,
} from "./clients";

describe("clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClients", () => {
    it("returns list of clients for an organization", async () => {
      const mockClients = [
        { id: "client1", name: "Client 1" },
        { id: "client2", name: "Client 2" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockClients });

      const result = await getClients("org1");

      expect(api.get).toHaveBeenCalledWith("/v1/organizations/org1/clients");
      expect(result).toEqual(mockClients);
    });
  });

  describe("getClient", () => {
    it("returns a specific client", async () => {
      const mockClient = { id: "client1", name: "Client 1" };
      vi.mocked(api.get).mockResolvedValueOnce(mockClient);

      const result = await getClient("org1", "client1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1"
      );
      expect(result).toEqual(mockClient);
    });
  });

  describe("createClient", () => {
    it("creates a new client with description", async () => {
      const mockClient = {
        id: "client1",
        name: "New Client",
        description: "A client",
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockClient);

      const result = await createClient("org1", {
        name: "New Client",
        description: "A client",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations/org1/clients", {
        name: "New Client",
        description: "A client",
      });
      expect(result).toEqual(mockClient);
    });

    it("creates a client without description", async () => {
      const mockClient = { id: "client1", name: "New Client" };
      vi.mocked(api.post).mockResolvedValueOnce(mockClient);

      const result = await createClient("org1", { name: "New Client" });

      expect(api.post).toHaveBeenCalledWith("/v1/organizations/org1/clients", {
        name: "New Client",
      });
      expect(result).toEqual(mockClient);
    });
  });

  describe("updateClient", () => {
    it("updates a client", async () => {
      const mockClient = { id: "client1", name: "Updated Client" };
      vi.mocked(api.patch).mockResolvedValueOnce(mockClient);

      const result = await updateClient("org1", "client1", {
        name: "Updated Client",
      });

      expect(api.patch).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1",
        { name: "Updated Client" }
      );
      expect(result).toEqual(mockClient);
    });
  });

  describe("deleteClient", () => {
    it("deletes a client", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await deleteClient("org1", "client1");

      expect(api.delete).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1"
      );
    });
  });

  describe("deactivateClient", () => {
    it("deactivates a client", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await deactivateClient("org1", "client1");

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1/deactivate"
      );
    });
  });

  describe("activateClient", () => {
    it("activates a client", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await activateClient("org1", "client1");

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1/activate"
      );
    });
  });

  // Certificates
  describe("getCertificates", () => {
    it("returns list of certificates for a client", async () => {
      const mockCerts = [
        { id: "cert1", name: "Cert 1", fingerprint: "abc123" },
        { id: "cert2", name: "Cert 2", fingerprint: "def456" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockCerts });

      const result = await getCertificates("org1", "client1");

      expect(api.get).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1/certificates"
      );
      expect(result).toEqual(mockCerts);
    });
  });

  describe("createCertificate", () => {
    it("creates a new certificate and returns response with key material", async () => {
      const mockResponse = {
        certificate: { id: "cert1", name: "New Cert" },
        private_key: "-----BEGIN PRIVATE KEY-----...",
        certificate_pem: "-----BEGIN CERTIFICATE-----...",
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await createCertificate("org1", "client1", {
        name: "New Cert",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1/certificates",
        { name: "New Cert" }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("revokeCertificate", () => {
    it("revokes a certificate", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await revokeCertificate("org1", "client1", "cert1");

      expect(api.post).toHaveBeenCalledWith(
        "/v1/organizations/org1/clients/client1/certificates/cert1/revoke"
      );
    });
  });
});
