/**
 * loadtest/k6-search-endpoints.js
 *
 * Load test targeting RoutTripo's actual highest-traffic route groups
 * (from a live route count of server.ts: /api/travelport is 36 routes — by far
 * the largest surface — followed by buses, checkout, and flights).
 *
 * SETUP:
 *   Install k6: https://k6.io/docs/get-started/installation/
 *     macOS:  brew install k6
 *     Linux:  sudo apt install k6   (or see k6.io docs for your distro)
 *
 * RUN:
 *   k6 run loadtest/k6-search-endpoints.js
 *
 *   Override target/stages from the command line:
 *   k6 run -e BASE_URL=https://staging.routtripo.com -e VUS=200 loadtest/k6-search-endpoints.js
 *
 * IMPORTANT: run this against STAGING first, never production, until you've confirmed
 * rate limits (globalLimiter: 5000/min, ipRateLimiter: 100/15min per IP) won't just
 * make every request 429 instead of testing real capacity. For a realistic prod-like
 * test, either raise the limiter thresholds temporarily on staging, or run k6 from
 * many source IPs (k6 Cloud) rather than one machine hitting the per-IP limiter.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const VUS = Number(__ENV.VUS || 50);

const errorRate = new Rate('errors');
const flightSearchDuration = new Trend('flight_search_duration');
const busSearchDuration = new Trend('bus_search_duration');
const checkoutDuration = new Trend('checkout_create_order_duration');

export const options = {
  scenarios: {
    // Ramping load — mirrors a realistic traffic spike (e.g. flash sale, festival booking rush)
    // rather than constant load, since that's the scenario most likely to actually break things.
    ramping_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: Math.round(VUS * 0.3) },  // warm-up
        { duration: '2m', target: VUS },                     // ramp to target
        { duration: '3m', target: VUS },                     // sustained peak
        { duration: '1m', target: Math.round(VUS * 2) },     // spike test
        { duration: '2m', target: 0 },                        // cool-down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // 95% of requests under 2s
    errors: ['rate<0.05'],                // less than 5% error rate
  },
};

const ORIGINS = ['Mumbai', 'Delhi', 'Pune', 'Bengaluru', 'Goa'];
const DESTINATIONS = ['Goa', 'Delhi', 'Bengaluru', 'Jaipur', 'Kochi'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  const origin = randomFrom(ORIGINS);
  const destination = randomFrom(DESTINATIONS.filter((d) => d !== origin));
  const date = '2026-12-15';

  // 1. Flight search (Travelport-backed — your largest route group, and the one with
  //    the known auth error 1012116 that needs resolving before real scale testing)
  const flightRes = http.post(
    `${BASE_URL}/api/travelport/search`,
    JSON.stringify({ origin, destination, date, passengers: 1 }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'flight_search' } }
  );
  flightSearchDuration.add(flightRes.timings.duration);
  errorRate.add(flightRes.status >= 400);
  check(flightRes, { 'flight search status is 200 or 429': (r) => r.status === 200 || r.status === 429 });

  sleep(1);

  // 2. Bus search
  const busRes = http.post(
    `${BASE_URL}/api/buses/search`,
    JSON.stringify({ origin, destination, date }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'bus_search' } }
  );
  busSearchDuration.add(busRes.timings.duration);
  errorRate.add(busRes.status >= 400);
  check(busRes, { 'bus search status is 200 or 429': (r) => r.status === 200 || r.status === 429 });

  sleep(1);

  // 3. Checkout order creation (payment path — different bottleneck profile: Firestore
  //    writes + Razorpay API call, not just read-heavy search)
  const checkoutRes = http.post(
    `${BASE_URL}/api/checkout/create-order`,
    JSON.stringify({ itemType: 'package', itemId: 'pkg_goa_1', quantity: 1 }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'checkout_create_order' } }
  );
  checkoutDuration.add(checkoutRes.timings.duration);
  errorRate.add(checkoutRes.status >= 400);
  check(checkoutRes, { 'checkout status is 200/401/429': (r) => [200, 401, 429].includes(r.status) });

  sleep(2);
}

/**
 * After a run, k6 prints p95/p99 latency and error rate per tagged endpoint. Watch for:
 *   - flight_search p95 far above bus_search/checkout -> confirms Travelport is the bottleneck,
 *     not your own infra (matches the known auth-error investigation already in progress)
 *   - error rate climbing sharply at the "spike" stage -> your rate limiters are working, but
 *     check whether legitimate users would see 429s during a real traffic spike (festival
 *     booking day) and whether globalLimiter's 5000/min ceiling needs raising for that.
 */
