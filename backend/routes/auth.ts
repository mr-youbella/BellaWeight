import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";

export default async function authRoutes(fastify: FastifyInstance)
{

	fastify.post("/login",
	{
		schema:
		{
			body:
			{
				type: "object",
				required: ["identifier", "password"],
				properties:
				{
					identifier: { type: "string" },
					password: { type: "string" },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { identifier, password } = req.body as { identifier: string, password: string };
		try
		{
			const { rows } = await fastify.pg.query(`SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1`, [identifier]);
			if (rows.length === 0)
				return reply.status(401).send({ error: "Invalid credentials" });
			const user = rows[0];
			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid)
				return reply.status(401).send({ error: "Invalid credentials" });
			const token = fastify.jwt.sign({ id: user.id, username: user.username, email: user.email }, { expiresIn: "7d" });
			return reply.send({
				
				token, user: { id: user.id, username: user.username, email: user.email }});
		}
		catch (err: any)
		{
			throw err;
		}
	});

	fastify.get("/me", { onRequest: [fastify.authenticate] }, async (req, reply) =>
	{
  		const	user = req.user as { id: number };
    	const	{ rows } = await fastify.pg.query( "SELECT id, username, email FROM users WHERE id = $1", [user.id]);
    	if (!rows.length)
    	    return (reply.status(401).send({ error: "User not found" }));
    	return (reply.send(rows[0]));
	});
}
