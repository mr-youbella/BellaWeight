import { FastifyInstance } from "fastify";

export default async function allWeightRoutes(fastify: FastifyInstance)
{
	fastify.get<{ Params: { user_id: string } }>("/all_weight/:user_id", async (req) =>
	{
		const { user_id } = req.params;
		const { rows } = await fastify.pg.query(`SELECT id, date, weight FROM all_weight WHERE user_id = $1 ORDER BY date DESC`, [user_id]);
		return (rows);
	});

	fastify.post<{Body: {user_id: number, weight: number, date?: string;}}>("/all_weight",
	{
		schema:
		{
			body:
			{
				type: "object",
				required: ["user_id", "weight"],
				properties:
				{
					user_id: { type: "integer" },
					weight: { type: "number" },
					date: { type: "string" },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { user_id, weight, date } = req.body;
		try
		{
			const { rows } = await fastify.pg.query(`INSERT INTO all_weight (user_id, weight, date) VALUES ($1, $2, $3) RETURNING id, weight, date`, [user_id, weight, date ?? new Date().toISOString()]);
			return (reply.code(201).send(rows[0]));
		} catch (err: any)
		{
			if (err.code === "23503")
				return (reply.code(404).send({ error: "User not found" }));
			throw err;
		}
	});

	fastify.delete<{ Params: { id: string } }>("/all_weight/:id", { onRequest: [fastify.authenticate] }, async (req, reply) =>
	{
		const { id } = req.params;
		const { rows } = await fastify.pg.query("DELETE FROM all_weight WHERE id = $1 RETURNING *", [id]);
		if (!rows.length)
			return (reply.code(404).send({ error: "Weight entry not found" }));
		return (reply.send({ message: "Deleted successfully", deleted: rows[0] }));
	});
}


