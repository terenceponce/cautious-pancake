// The headline stress test: BUYERS concurrent buyers race for STOCK units.
// Passes only if exactly STOCK purchases succeed — an oversell or undersell
// fails the run via the exact-count thresholds.
//
//   k6 run -e STOCK=100 -e BUYERS=5000 -e VUS=500 purchase-burst.js
//
// BASE_URL defaults to the bare server; point it at the compose nginx edge
// (http://localhost:8080) to load-test the full path.

import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'
import exec from 'k6/execution'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const STOCK = Number(__ENV.STOCK || 100)
const BUYERS = Number(__ENV.BUYERS || 5000)
const VUS = Number(__ENV.VUS || 500)

const successes = new Counter('purchase_success')
const soldOut = new Counter('purchase_sold_out')

// 409/410/403 are expected outcomes, not failures — only 5xx count against us.
http.setResponseCallback(http.expectedStatuses(200, 409, 410, 403))

export const options = {
  scenarios: {
    buyers: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: BUYERS,
      maxDuration: '5m',
    },
  },
  thresholds: {
    http_req_failed: ['rate==0'],
    // The simultaneous first wave queues on a single process, so p95 includes
    // queueing, not just service time — steady-state latency is proven by
    // post-sellout.js. Med/p90 carry the hot-path story here.
    http_req_duration: ['p(95)<500'],
    purchase_success: [`count==${STOCK}`],
    purchase_sold_out: [`count==${BUYERS - STOCK}`],
  },
}

export default function () {
  // Globally unique across VUs and iterations: one attempt per buyer.
  const userId = `buyer-${exec.scenario.iterationInTest}`
  const res = http.post(`${BASE_URL}/api/purchase`, JSON.stringify({ userId }), {
    headers: { 'Content-Type': 'application/json' },
  })
  check(res, { 'outcome parsed': (r) => r.json('outcome') !== undefined })

  if (res.status === 200) successes.add(1)
  else if (res.status === 410) soldOut.add(1)
}
