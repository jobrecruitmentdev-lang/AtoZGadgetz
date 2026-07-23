import axios from 'axios';

// CJ Dropshipping enforces a 1 request/second QPS limit account-wide. Exceeding it
// sometimes throws an explicit "Too Many Requests" error and sometimes silently
// returns an empty result set with a 200 — both looked like "no products" bugs
// until traced back to concurrent/rapid calls. This gate serializes every outbound
// CJ call (auth, search, product detail, orders, shipments) to stay just under the limit.
const MIN_INTERVAL_MS = 1100;
let chain: Promise<void> = Promise.resolve();
let lastCallAt = 0;

function throttle(): Promise<void> {
  const turn = chain.then(async () => {
    const remaining = lastCallAt + MIN_INTERVAL_MS - Date.now();
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    lastCallAt = Date.now();
  });
  chain = turn.catch(() => {});
  return turn;
}

export const cjHttp = axios.create();
cjHttp.interceptors.request.use(async (config) => {
  await throttle();
  return config;
});
