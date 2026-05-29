import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import postgres from "@fastify/postgres";
import fastifyJwt from "@fastify/jwt"
import users from "./routes/users";
import dataRoutes from "./routes/data";
import allWeightRoutes from "./routes/all_weight";
import auth from "./routes/auth";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: process.env.CORS_WEBSITE, methods: ["GET", "POST", "PUT", "DELETE"] });
fastify.register(postgres, { connectionString: process.env.DATABASE_URL });
fastify.register(users);
fastify.register(dataRoutes);
fastify.register(allWeightRoutes);
fastify.register(auth);
fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET! });
declare module "fastify" { interface FastifyInstance { authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void> }}

fastify.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) =>
{
  	try 
	{
		await req.jwtVerify();
	}
	catch (err)
	{
		return (reply.status(401).send({ error: "Invalid or expired token" }));
	}
});


async function checkDatabaseConnection()
{
 	try
	{
		const client = await fastify.pg.connect();
		await client.query("SELECT 1");
		client.release();
		fastify.log.info("✅ Database connected successfully");
	}
	catch (err)
	{
		console.error("❌ Database connection failed:", err);
		process.exit(1);
	}
};

async function start()
{
	try
	{
		await fastify.listen ({ port: Number(process.env.PORT), host: "0.0.0.0" });	
		fastify.log.info("Server running successfully 🚀");
		await checkDatabaseConnection();
	}
	catch (err)
	{
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
