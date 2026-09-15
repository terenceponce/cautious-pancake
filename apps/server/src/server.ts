import { loadConfig } from './config.js'
import { buildApp } from './app.js'

const config = loadConfig()
const app = buildApp(config)

app.listen({ port: config.PORT, host: '0.0.0.0' })

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    void app.close().then(() => process.exit(0))
  })
}
