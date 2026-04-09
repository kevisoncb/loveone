import { getDb, getUserByOpenId, upsertUser } from "../../db";
import { firebaseAdmin } from "../../_core/firebase";

/**
 * Synchronizes a user from a Firebase ID token with the local database.
 * This function is designed to be safe from race conditions by using an upsert operation.
 * @param idToken The Firebase ID token.
 * @returns The synchronized user from the database.
 */
export async function syncUserWithFirebase(idToken: string) {
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  const openId = decodedToken.uid;

  // The existing `upsertUser` function in `db.ts` uses `onDuplicateKeyUpdate`,
  // which is perfect for handling concurrent requests safely. It will either create
  // the user or update their `lastSignedIn` timestamp if they already exist.
  await upsertUser({
    openId: openId,
    email: decodedToken.email,
    name: decodedToken.name,
    lastSignedIn: new Date(),
  });

  // After the upsert, we can safely get the user.
  const user = await getUserByOpenId(openId);

  if (!user) {
    // This case should ideally not be reached if the upsert is successful.
    throw new Error("Failed to retrieve user after sync operation.");
  }

  return user;
}
