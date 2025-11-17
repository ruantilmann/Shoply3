// c:\Users\Ruan\Documents\Projetos\better-t-stack\Shoply3\apps\server\src\middleware\auth-guard.ts
import type { FastifyRequest, FastifyReply } from "fastify";

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const session = (request as any).session;
  if (!session?.user?.id) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}