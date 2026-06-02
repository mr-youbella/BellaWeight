import { FastifyInstance } from "fastify";

export default async function planksRoutes(fastify: FastifyInstance)
{
	fastify.get<{ Params: { user_id: string } }>("/planks/:user_id", { onRequest: [fastify.authenticate] }, async (req, reply) =>
	{
		const { user_id } = req.params;
		const { rows } = await fastify.pg.query(`SELECT * FROM planks WHERE user_id = $1 ORDER BY date DESC`, [user_id]);
		return (reply.send(rows));
	});

	fastify.post("/planks",
	{
		onRequest: [fastify.authenticate],
		schema:
		{
			body:
			{
				type: "object",
				required: ["user_id", "minutes", "seconds"],
				properties:
				{
					user_id: { type: "integer" },
					minutes: { type: "integer", minimum: 0 },
					seconds: { type: "integer", minimum: 0, maximum: 59 },
					date: { type: "string" },
				},
			},
		},
	}, async (req, reply) =>
	{
		const { user_id, minutes, seconds, date } = req.body as { user_id: number; minutes: number; seconds: number; date?: string; };
		const { rows } = await fastify.pg.query(`INSERT INTO planks (user_id, minutes, seconds, date) VALUES ($1, $2, $3, $4) RETURNING *`, [user_id, minutes, seconds, date ?? new Date().toISOString()]);
		return (reply.status(201).send(rows[0]));
	});

	fastify.delete<{ Params: { id: string } }>("/planks/:id", { onRequest: [fastify.authenticate] }, async (req, reply) =>
	{
		const { id } = req.params;
		const { rows } = await fastify.pg.query(`DELETE FROM planks WHERE id = $1 RETURNING *`, [id]);
		if (!rows.length)
			return (reply.code(404).send({ error: "Workout not found" }));
		return (reply.send({ message: "Deleted successfully" }));
	});
}
