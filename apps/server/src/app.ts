import Fastify, { type FastifyInstance } from 'fastify'
import type { Config } from './config.js'
import { saleRoutes } from './routes/sale.js'

export function buildApp(config: Config): FastifyInstance {
  const app = Fastify({ logger: true })

  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/ready', async () => ({ status: 'ready' }))

  app.register(saleRoutes, { prefix: '/api', config })

  return app
}
