import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
	/**
	 * @api {get} /search Search
	 */
	app.get<{
    Querystring: {
      q: string
    }
  }>(
		'/',
		{
			schema: {
				querystring: {
					type: 'object',
					properties: {
						q: {
							type: 'string'
						}
					}
				},
				response: {
					200: {
						type: 'object',
						properties: {
							questions: {
								type: 'array',
								nullable: true,
								items: {
									type: 'object',
									properties: {
										id: {
											type: 'integer'
										},
										title: {
											type: 'string'
										}
									}
								}
							},
							users: {
								type: 'array',
								nullable: true,
								items: {
									type: 'object',
									properties: {
										id: {
											type: 'integer'
										},
										displayName: {
											type: 'string'
										},
										picture: {
											type: 'string'
										}
									}
								}
							},
							tags: {
								type: 'array',
								nullable: true,
								items: {
									type: 'object',
									properties: {
										id: {
											type: 'integer'
										},
										title: {
											type: 'string'
										}
									}
								}
							}
						}
					}
				}
			}
		},
		async function (req) {
			const { q: searchTerm } = req.query
			const formattedTerm = searchTerm.split(' ')
			let formattedString = ''
			for (let i = 0; i < formattedTerm.length; i++) {
				let term = `${formattedTerm[i]}:*`
				if (i !== formattedTerm.length - 1) {
					term = term + `+`
				}

				formattedString += term
			}

			let formattedReString = searchTerm.replace(' ', '+')
			console.log(formattedReString)

			const query = {
				text: `
					SELECT (
									 SELECT jsonb_agg(x)
									 FROM (
													SELECT id,
																 title
													FROM question q
													WHERE to_tsvector(title) @@ to_tsquery($1)
													LIMIT 3
												) x
								 ) AS "questions",
								 (
									 SELECT jsonb_agg(y)
									 FROM (
													SELECT id, "displayName", picture
													FROM "user" u
													WHERE to_tsvector("displayName") @@ to_tsquery($1)
													LIMIT 3
												) y
								 ) AS "users",
								 (
									 SELECT jsonb_agg(z)
									 FROM (
													SELECT id, title FROM tag t WHERE to_tsvector(title) @@ to_tsquery($1) LIMIT 3
												) z
								 ) AS "tags"
				`,
				values: [formattedReString]
			}
			const { rows } = await app.pg.query(query)
			return rows[0]
		}
	)
}
