import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import { API_PRODUCTION_DEFAULTS } from '../api-config';

const LOCAL_HOSTS = ['localhost', '127.0.0.1'] as const;

const DEFAULT_PANEL_HOSTS = [
  'admin.mentoma.ir',
  'admin.mentoma.ir',
  'panel-academy.darkube.ir',
  ...LOCAL_HOSTS
] as const;

const DEFAULT_BACKEND_HOSTS = [
  'api.mentoma.ir',
  'api.mentoma.ir',
  'api-academy.darkube.ir',
  ...LOCAL_HOSTS
] as const;

const DEFAULT_MENTOMA_BASE_DOMAINS = [
  'mentoma.ir',
  'mentoma.ir',
  'darkube.ir'
] as const;

export const DEFAULT_GEO_SERVICE_URLS = [
  'https://ipapi.co/json/',
  'https://ip-api.com/json/',
  'https://api.country.is/'
] as const;

function parseEnvHosts(
  raw: string | undefined,
  fallback: readonly string[]
): string[] {
  if (!raw?.trim()) return [...fallback];
  return raw
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function getAllowedPanelHosts(): string[] {
  return parseEnvHosts(
    process.env.SECURITY_ALLOWED_PANEL_HOSTS,
    DEFAULT_PANEL_HOSTS
  );
}

export function getAllowedBackendHosts(): string[] {
  return parseEnvHosts(
    process.env.SECURITY_ALLOWED_BACKEND_HOSTS,
    DEFAULT_BACKEND_HOSTS
  );
}

export function getMentomaBaseDomains(): string[] {
  return parseEnvHosts(
    process.env.SECURITY_MENTOMA_BASE_DOMAINS,
    DEFAULT_MENTOMA_BASE_DOMAINS
  );
}

export function normalizeHostname(host: string): string {
  const trimmed = host.trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed.split(':')[0] ?? trimmed;
}

/**
 * K8s/Darkube HTTP probes call the pod IP and send Host: <pod-ip>.
 * Those must pass the trusted-host guard or readiness stays 403 forever.
 */
export function isClusterOrLoopbackHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return true;
  }
  if (/^10\./.test(host) || /^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return host.endsWith('.cluster.local') || host.endsWith('.svc');
}

export function isHostAllowed(
  hostname: string,
  allowlist: readonly string[]
): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return false;

  return allowlist.some((allowed) => {
    const entry = allowed.toLowerCase();
    if (host === entry) return true;
    if (entry.startsWith('*.')) {
      const base = entry.slice(2);
      return host === base || host.endsWith(`.${base}`);
    }
    return host.endsWith(`.${entry}`);
  });
}

export function isHostUnderMentomaDomains(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return getMentomaBaseDomains().some(
    (base) => host === base || host.endsWith(`.${base}`)
  );
}

export function getServerActionAllowedOrigins(): string[] {
  const fromEnv = process.env.SECURITY_SERVER_ACTION_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (fromEnv?.length) return fromEnv;

  return [
    API_PRODUCTION_DEFAULTS.panelHost,
    'https://admin.mentoma.ir',
    'https://panel-academy.darkube.ir',
    'http://localhost:4000',
    'http://127.0.0.1:4000'
  ];
}

export function getAllowedImageRemotePatterns(): RemotePattern[] {
  const hosts = [
    ...getAllowedPanelHosts(),
    ...getAllowedBackendHosts(),
    ...getMentomaBaseDomains().map((d) => `*.${d}`)
  ];

  const unique = Array.from(new Set(hosts));

  return unique.flatMap((hostname) => [
    { protocol: 'https' as const, hostname, pathname: '/**' },
    ...(LOCAL_HOSTS.includes(hostname as (typeof LOCAL_HOSTS)[number])
      ? [{ protocol: 'http' as const, hostname, pathname: '/**' }]
      : [])
  ]);
}

export function buildProductionCspConnectSrc(): string {
  const hosts = [
    "'self'",
    ...getAllowedBackendHosts().map((h) => `https://${h}`),
    ...getMentomaBaseDomains().flatMap((d) => [
      `https://*.${d}`,
      `wss://*.${d}`
    ]),
    'wss:'
  ];
  return Array.from(new Set(hosts)).join(' ');
}

export function buildProductionCspImgSrc(): string {
  const hosts = [
    "'self'",
    'data:',
    'blob:',
    ...getAllowedBackendHosts().map((h) => `https://${h}`),
    ...getMentomaBaseDomains().map((d) => `https://*.${d}`)
  ];
  return Array.from(new Set(hosts)).join(' ');
}
