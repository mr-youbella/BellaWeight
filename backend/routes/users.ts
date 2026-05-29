import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export default async function usersRoutes(fastify: FastifyInstance)
{
	fastify.get("/users", async () =>
	{
		const { rows } = await fastify.pg.query("SELECT id, username, email, created_at FROM users ORDER BY created_at DESC");
		return (rows);
	});

	fastify.get<{ Params: { id: string } }>("/users/:id", async (req, reply) =>
	{
		const { id } = req.params;
		const { rows } = await fastify.pg.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [id]);
		if (!rows.length)
			return (reply.code(404).send({ error: "User not found" }));
		return (rows[0]);
	});

	fastify.post<{Body: {username: string, email: string, password: string}}>("/users",
	{
		schema:
		{
			body:
			{
				type: "object",
				required: ["username", "email", "password"],
				properties:
				{
					username: { type: "string", minLength: 3 },
					email: { type: "string", format: "email" },
					password: { type: "string", minLength: 6 },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { username, email, password } = req.body;
		try
		{
			const hashed = await bcrypt.hash(password, SALT_ROUNDS);
			const { rows } = await fastify.pg.query(`INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at`, [username, email, hashed]);
			return (reply.code(201).send(rows[0]));
		}
		catch (err: any)
		{
			if (err.code === "23505")
			{
				const field = err.detail?.includes("username") ? "username" : "email";
				return (reply.code(409).send({error: `${field} already exists`}));
			}
			throw err;
		}
	});
}
