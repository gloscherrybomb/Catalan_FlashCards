import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { FIRESTORE_PROXY_PATH } from './firestoreReachability';

/**
 * The proxy rewrite has one silent failure mode.
 *
 * vercel.json rewrites are evaluated in order and the SPA catch-all matches
 * everything. If the Firestore rule ever falls below it, every proxied request
 * is answered with index.html: a 200 full of HTML where the SDK expects JSON.
 * Nothing 404s, nothing errors at the edge, and the app just stops syncing.
 */
describe('Firestore proxy routing', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const rewrites: Array<{ source: string; destination: string }> = config.rewrites ?? [];

  it('routes the proxy path to Firestore', () => {
    const proxy = rewrites.find(rule => rule.source.includes(FIRESTORE_PROXY_PATH));

    expect(proxy, `no rewrite for /${FIRESTORE_PROXY_PATH}`).toBeDefined();
    expect(proxy!.destination).toContain('firestore.googleapis.com');
  });

  it('matches the proxy before the single-page-app catch-all', () => {
    const proxyIndex = rewrites.findIndex(rule => rule.source.includes(FIRESTORE_PROXY_PATH));
    const catchAllIndex = rewrites.findIndex(rule => rule.destination === '/index.html');

    expect(proxyIndex).toBeGreaterThanOrEqual(0);
    expect(catchAllIndex).toBeGreaterThanOrEqual(0);
    expect(proxyIndex).toBeLessThan(catchAllIndex);
  });
});
