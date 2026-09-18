// After the sale is sold out, traffic usually keeps coming. This floods the
// purchase endpoint for DURATION seconds and proves every request gets an
// instant sold_out (410) with healthy latency — the "rejections are nearly
// free" claim of ADR-0011.
//
//   k6 run -e VUS=200 -e DURATION=30s post-sellout.js

import http from 'k6/http'
import { check } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const VUS = Number(__ENV.VUS || 200)
const DURATION = __ENV.DURATION || '30s'

http.setResponseCallback(http.expectedStatuses(200, 409, 410, 403))

export const options = {
  scenarios: {
    flood: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<50'],
    checks: ['rate==1'],
  },
}

export default function () {
  const res = http.post(
    `${BASE_URL}/api/purchase`,
    JSON.stringify({ userId: `latecomer-${__ITER}` }),
    { headers: { 'Content-Type': 'application/json' } },
  )
  check(res, {
    'rejected as sold_out': (r) => r.status === 410 && r.json('outcome') === 'sold_out',
  })
}
