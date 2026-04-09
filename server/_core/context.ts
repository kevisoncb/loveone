import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { firebaseAdmin } from "./firebase";
import { db } from "../db";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const idToken = req.headers.authorization.split(" ")[1];
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        const user = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.firebaseUid, decodedToken.uid) });
        return user || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  const user = await getUserFromHeader();

  return {
    req,
    res,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
