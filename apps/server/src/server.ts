import { loadConfig } from './config.js'
import { buildApp } from './app.js'
import { createStore } from './stores/index.js'

const config = loadConfig()
const store = createStore(config)
await store.init(config.STOCK)

const app = await buildApp({ config, store })
await app.listen({ port: config.PORT, host: '0.0.0.0' })

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    void app.close().then(() => process.exit(0))
  })
}
