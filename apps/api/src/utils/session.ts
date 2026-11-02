import { randomBytes, createHash } from "node:crypto";
import  {prisma} from "../config/client";

export async function createSession(userId: string) {
  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256")
    .update(sessionToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    sessionToken,
    expiresAt,
  };
}
