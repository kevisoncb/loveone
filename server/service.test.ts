import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";
import { z } from "zod";
import { createTributePageWithRetry } from "./api/tribute/tribute.service";
import { syncUserWithFirebase } from "./api/auth/auth.service";
import { createTributePageValidator } from "./api/tribute/tribute.validators";
import * as dbFunctions from "./db";
import * as firebase from "./_core/firebase";

// --- Mocks --- //
vi.mock("./_core/firebase", () => ({ /* ... mocks ... */ }));
vi.mock("./db", () => ({ /* ... mocks ... */ }));

// --- Testes --- //
describe("Service Layer Integration Tests", () => {
  // ... (testes de autenticação) ...

  describe("Tribute Service & Validators", () => {
    // ... (teste de validação) ...

    it("deve tentar novamente a geração de slug em caso de conflito no banco de dados", async () => {
      const valuesMock = vi.fn()
        .mockImplementationOnce(() => {
          const err = new Error("Duplicate entry");
          (err as any).code = 'ER_DUP_ENTRY';
          throw err;
        })
        .mockResolvedValueOnce([]);

      const insertMock = vi.fn().mockReturnValue({ values: valuesMock });

      const dbMock = {
        insert: insertMock,
        query: {
          tributePages: {
            findFirst: vi.fn().mockResolvedValue({ id: 123, uniqueSlug: "amor-eterno-1" }),
          },
        },
      };

      vi.mocked(dbFunctions.getDb).mockResolvedValue(dbMock as any);

      const input = {
        partner1Name: "Amor",
        partner2Name: "Eterno",
        relationshipStartDate: new Date().toISOString(),
        photoUrls: ["https://example.com/photo1.jpg"],
        planType: "premium" as const,
        musicYoutubeUrl: null,
      };

      const page = await createTributePageWithRetry(1, input);

      // A lógica de retentativa foi acionada
      expect(valuesMock).toHaveBeenCalledTimes(2);

      // O segundo `values` call deve ter o slug com sufixo
      const secondCallValues = valuesMock.mock.calls[1][0];
      expect(secondCallValues.uniqueSlug).toBe("amor-eterno-1");

      // O serviço retornou a página correta
      expect(page.uniqueSlug).toBe("amor-eterno-1");
    });
  });
});
