// c:\Users\Ruan\Documents\Projetos\better-t-stack\Shoply3\apps\server\src\routes\lists.routes.ts
import type { FastifyInstance } from "fastify";
import { authGuard } from "../middleware/auth-guard";
import prisma from "../lib/prisma";
import z from "zod";

export async function registerListRoutes(fastify: FastifyInstance) {
  fastify.get("/api/lists", { preHandler: authGuard }, async (request, reply) => {
    const session = (request as any).session;
    const lists = await prisma.list.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    reply.send(lists);
  });

  fastify.post("/api/lists", { preHandler: authGuard }, async (request, reply) => {
    const schema = z.object({ name: z.string().min(1).max(100) });
    const parsed = schema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload" });
    }
    const now = new Date();
    const list = await prisma.list.create({
      data: {
        id: crypto.randomUUID(),
        name: parsed.data.name,
        createdAt: now,
        updatedAt: now,
        userId: (request as any).session.user.id,
      },
    });
    reply.status(201).send(list);
  });
}