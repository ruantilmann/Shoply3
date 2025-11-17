// c:\Users\Ruan\Documents\Projetos\better-t-stack\Shoply3\apps\server\src\plugins\session.ts
import { auth } from "@shoply3/auth";
import type { FastifyInstance } from "fastify";

export async function registerSession(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request) => {
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>),
      query: request.query as { disableCookieCache?: boolean; disableRefresh?: boolean },
    });
    (request as any).session = session;
  });
}