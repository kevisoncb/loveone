import { getDb, tributePages } from "../../db";
import { CreateTributePageInput } from "./tribute.validators";
import { generateSlug } from "../../_core/utils/generateSlug";
import { TRPCError } from "@trpc/server";

const MAX_RETRY_COUNT = 5;

/**
 * Creates a tribute page with a retry mechanism for unique slug generation.
 */
export async function createTributePageWithRetry(
  userId: number,
  input: CreateTributePageInput
) {
  let retryCount = 0;
  let lastError: any = null;

  while (retryCount < MAX_RETRY_COUNT) {
    const baseSlug = generateSlug(`${input.partner1Name} ${input.partner2Name}`);
    const uniqueSlug = retryCount > 0 ? `${baseSlug}-${retryCount}` : baseSlug;

    try {
      const db = await getDb();
      
      // Objeto de dados preparado para o banco de dados
      const valuesToInsert = {
        ...input,
        userId,
        uniqueSlug,
        musicYoutubeUrl: input.musicYoutubeUrl ?? null,
        // CORREÇÃO: Converter explicitamente o array para uma string JSON.
        photoUrls: JSON.stringify(input.photoUrls),
        // CORREÇÃO: Converter a string ISO para um objeto Date, que o Drizzle/MySQL manipula.
        relationshipStartDate: new Date(input.relationshipStartDate),
      };

      await db.insert(tributePages).values(valuesToInsert);

      const newPage = await db.query.tributePages.findFirst({
        where: (table, { eq }) => eq(table.uniqueSlug, uniqueSlug),
      });

      if (newPage) {
        return newPage;
      }
      throw new Error("Failed to retrieve the newly created page.");

    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        lastError = error;
        retryCount++;
        continue;
      }
      throw error;
    }
  }

  throw new TRPCError({
    code: "CONFLICT",
    message: "Could not create a unique page. Please try a different name.",
    cause: lastError,
  });
}
