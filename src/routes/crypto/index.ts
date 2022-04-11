import crypto, { randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import argon2 from 'argon2'
import { FastifyInstance } from 'fastify'

const scrypt = promisify(crypto.scrypt)

async function _hash(password: string) {
  const salt = randomBytes(16).toString('hex')

  const derivedKey = await scrypt(password, salt, 64)
  // @ts-ignore
  return salt + ':' + derivedKey.toString('hex')
}

async function _verify(password: string, hash: string) {
  const [salt, key] = hash.split(':')
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = await scrypt(password, salt, 64)
  // @ts-ignore
  return timingSafeEqual(keyBuffer, derivedKey)
}

export default async (fastify: FastifyInstance) => {
  fastify.get('/:password', async (req, reply) => {
    const password1 = await _hash('123456')
    // const password2 = await hash('123456')

    console.log('password1', await _verify('123456', password1))
    // 	console.log('password2', await verify('123456', password2))
    // console.log('password1 === password2', password1 === password2)

    return { password1 }
  })

  fastify.get('/argon', async (request, reply) => {
    /*		try {
			const hash = await argon2.hash('123456')
			if (await argon2.verify(hash, '123456')) {
				return { hash, security: true }
			} else {
				console.log('no match!')
				return { hash, security: false }
			}
		} catch (e) {
			throw e
		}*/
  })
}
