import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
	app.get<{
    Params: {
      offset: number
    }
  }>(
		'/',
		{
			schema: {
				params: {
					type: 'object',
					properties: {
						offset: {
							type: 'integer'
						}
					}
				}
			}
		},
		async ({ params: { offset } }) => {
			const query = {
				text: `
					SELECT q.id,
								 q.title,
								 q."creationTime",
								 (
									 SELECT json_agg(
														json_build_object(
															'id', t.id,
															'title', t.title
															)
														)
									 FROM unnest(q.tags) item_id
													LEFT JOIN tag t ON t.id = item_id
								 ) AS tags,
								 (
									 SELECT json_build_object(
														'id', id,
														'displayName', "displayName",
														'picture', picture
														)
									 FROM "user" u
									 WHERE u.id = q."userId"
								 ) AS "user"
					FROM question q
					ORDER BY q.id DESC
					LIMIT 12 OFFSET $1
				`,
				values: [offset]
			}

			try {
				const { rows } = await app.pg.query(query)
				return rows
			} catch (e) {
				throw e
			}
		}
	)
}
