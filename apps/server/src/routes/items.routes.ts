import type { FastifyInstance } from "fastify";
import { authGuard } from "../middleware/auth-guard";
import prisma from "../lib/prisma";
import z from "zod";

export async function registerItemRoutes(fastify: FastifyInstance) {
  fastify.get("/api/lists/:id/items", { preHandler: authGuard }, async (request, reply) => {
    const session = (request as any).session;
    const listId = (request.params as any).id as string;

    const list = await prisma.list.findFirst({ where: { id: listId, userId: session.user.id }, select: { id: true } });
    if (!list) {
      return reply.status(404).send({ error: "List not found" });
    }

    const items = await prisma.item.findMany({
      where: { listId },
      orderBy: [{ purchased: "asc" }, { updatedAt: "desc" }],
    });
    reply.send(items);
  });

  fastify.post("/api/lists/:id/items", { preHandler: authGuard }, async (request, reply) => {
    const schema = z.object({
      name: z.string().trim().min(1).max(100),
      quantity: z.number().positive().default(1),
      unit: z.string().trim().min(1).max(20).optional(),
      pricePlanned: z.number().nonnegative().optional(),
    });
    const parsed = schema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const session = (request as any).session;
    const listId = (request.params as any).id as string;

    const list = await prisma.list.findFirst({ where: { id: listId, userId: session.user.id }, select: { id: true } });
    if (!list) {
      return reply.status(404).send({ error: "List not found" });
    }

    const now = new Date();
    const item = await prisma.item.create({
      data: {
        id: crypto.randomUUID(),
        listId,
        name: parsed.data.name,
        quantity: parsed.data.quantity ?? 1,
        unit: parsed.data.unit ?? "un",
        pricePlanned: parsed.data.pricePlanned,
        createdAt: now,
        updatedAt: now,
        purchased: false,
      },
    });
    reply.status(201).send(item);
  });

  fastify.delete("/api/lists/:id/items/:itemId", { preHandler: authGuard }, async (request, reply) => {
    const session = (request as any).session;
    const params = request.params as any;
    const listId = params.id as string;
    const itemId = params.itemId as string;

    const list = await prisma.list.findFirst({ where: { id: listId, userId: session.user.id }, select: { id: true } });
    if (!list) {
      return reply.status(404).send({ error: "List not found" });
    }

    const item = await prisma.item.findFirst({ where: { id: itemId, listId }, select: { id: true } });
    if (!item) {
      return reply.status(404).send({ error: "Item not found" });
    }

    await prisma.item.delete({ where: { id: itemId } });
    reply.status(204).send();
  });
}