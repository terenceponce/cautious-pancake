import Fastify, { type FastifyInstance } from 'fastify'
import type { Config } from './config.js'
import { saleRoutes } from './routes/sale.js'
import { createStore } from './stores/index.js'
import type { SaleStore } from './stores/sale-store.js'

export interface AppOptions {
  config: Config
  store?: SaleStore
}

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const store = options.store ?? createStore(options.config)

  const app = Fastify({ logger: true })

  app.get('/health', async () => ({ status: 'ok' }))
  app.get('/ready', async () => ({ status: 'ready' }))

  app.register(saleRoutes, { prefix: '/api', config: options.config, store })

  app.addHook('onClose', async () => {
    await store.close()
  })

  return app
}
