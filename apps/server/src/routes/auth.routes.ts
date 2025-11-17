// c:\Users\Ruan\Documents\Projetos\better-t-stack\Shoply3\apps\server\src\routes\auth.routes.ts
import type { FastifyInstance } from "fastify";
import { auth } from "@shoply3/auth";

export async function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = new Headers();
        Object.entries(request.headers as Record<string, any>).forEach(([key, value]) => {
          if (value) headers.append(key, String(value));
        });
        const body = request.body ? JSON.stringify(request.body) : undefined;
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body,
        });
        const response = await auth.handler(req);
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch {
        reply.status(500).send({ error: "Internal authentication error", code: "AUTH_FAILURE" });
      }
    },
  });
}