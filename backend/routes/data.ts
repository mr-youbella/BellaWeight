import { FastifyInstance } from "fastify";

export default async function dataRoutes(fastify: FastifyInstance)
{
	fastify.get("/data", async () =>
	{
		const { rows } = await fastify.pg.query("SELECT * FROM data ORDER BY date DESC");
		return (rows);
	});

	fastify.get<{ Params: { user_id: string } }>("/data/:user_id", async (req, reply) =>
	{
		const { user_id } = req.params;
		const { rows } = await fastify.pg.query("SELECT * FROM data WHERE user_id = $1", [user_id]);
		if (!rows.length)
			return reply.code(404).send({ error: "Profile not found" });
		return (rows[0]);
	});

	fastify.post<{Body: {user_id: number,name: string,height: number,weight: number,goal_weight: number};}>("/data",
	{
		schema:
		{
			body:
			{
				type: "object",
				required: ["user_id", "name", "height", "weight", "goal_weight"],
				properties:
				{
					user_id: { type: "integer" },
					name: { type: "string" },
					height: { type: "number" },
					weight: { type: "number" },
					goal_weight: { type: "number" },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { user_id, name, height, weight, goal_weight } = req.body;
		try
		{
			const { rows } = await fastify.pg.query(`INSERT INTO data (user_id, name, height, weight, goal_weight, date) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`, [user_id, name, height, weight, goal_weight]);
			return (reply.code(201).send(rows[0]));
		}
		catch (err: any)
		{
			if (err.code === "23505")
				return (reply.code(409).send({ error: "This user already has a profile" }));
			if (err.code === "23503")
				return (reply.code(404).send({ error: "User not found" }));
			throw err;
		}
	});
}
