import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { auth } from "../../../packages/auth/src/index.ts";
import prisma from "../../../packages/db/src/index.ts";
import z from "zod";

const baseCorsConfig = {
	origin: process.env.CORS_ORIGIN || "http://localhost:3001",
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86400,
};

const fastify = Fastify({
	logger: true,
});

fastify.register(fastifyCors, baseCorsConfig);

fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			const url = new URL(request.url, `http://${request.headers.host}`);
			const headers = new Headers();
			Object.entries(request.headers).forEach(([key, value]) => {
				if (value) headers.append(key, value.toString());
			});
			const req = new Request(url.toString(), {
				method: request.method,
				headers,
				body: request.body ? JSON.stringify(request.body) : undefined,
			});
			const response = await auth.handler(req);
			reply.status(response.status);
			response.headers.forEach((value, key) => reply.header(key, value));
			reply.send(response.body ? await response.text() : null);
		} catch (error) {
			fastify.log.error({ err: error }, "Authentication Error:");
			reply.status(500).send({
				error: "Internal authentication error",
				code: "AUTH_FAILURE",
			});
		}
	},
});

fastify.get("/api/lists", async (request, reply) => {
	try {
		const session = await auth.api.getSession(request, reply);//getSession(request, reply);
		if (!session?.user?.id) {
			return reply.status(401).send({ error: "Unauthorized" });
		}
			const lists = await prisma.list.findMany({
			where: { userId: session.user.id },
			orderBy: { updatedAt: "desc" },
		});
		reply.send(lists);
	} catch (err) {
		reply.status(500).send({ error: "Failed to load lists" });
	}
});

fastify.post("/api/lists", async (request, reply) => {
	try {
		const session = await auth.api.getSession(request, reply);
		if (!session?.user?.id) {
			return reply.status(401).send({ error: "Unauthorized", detail: "no-user" });
		}
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
				userId: session.user.id,
			},
		});
		reply.status(201).send(list);
	} catch (err) {
		reply.status(500).send({ error: "Failed to create list" });
	}
});

fastify.get("/", async () => {
	return "OK";
});

fastify.listen({ port: 3000 }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log("Server running on port 3000");
});
