import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerListRoutes } from "./routes/lists.routes";
import { registerItemRoutes } from "./routes/items.routes";
import { registerSession } from "./plugins/session";

//import { auth } from "@shoply3/auth";
//import prisma from "@shoply3/db";
//import z from "zod";

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
registerSession(fastify);

registerAuthRoutes(fastify);
/* removed inline auth proxy */
/* inline handler moved to routes/auth.routes.ts */
/*
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
			response.headers.forEach((value: string, key: string) => {
				reply.header(key, value);
			});
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
*/

registerListRoutes(fastify);
registerItemRoutes(fastify);
/* moved lists routes to routes/lists.routes.ts */
/*
fastify.get("/api/lists", async (request, reply) => {
	try {
		const session = await auth.api.getSession({
			headers: request.headers as any,  // Fastify trabalha com IncomingHttpHeaders
			query: request.query as any       // se precisar
		});
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
*/

/*
fastify.post("/api/lists", async (request, reply) => {
	try {
		const session = await auth.api.getSession({
			headers: request.headers as any,  // Fastify trabalha com IncomingHttpHeaders
			query: request.query as any       // se precisar
		});
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
*/

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
