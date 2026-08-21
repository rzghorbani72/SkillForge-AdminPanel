/**
 * Where academy custom domains must point so traffic reaches Mentoma’s
 * Hamravesh cluster. Override in env when the cluster hostname changes.
 */
export const CUSTOM_DOMAIN_CNAME_TARGET =
  process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET ??
  'c13.hamravesh.onhamravesh.ir';

export type DnsRecordRow = {
  type: string;
  name: string;
  value: string;
};

export function stripDnsDot(value: string): string {
  return value.trim().replace(/\.$/, '');
}

export function apexFromHostname(hostname: string): string {
  const host = stripDnsDot(hostname).toLowerCase();
  return host.startsWith('www.') ? host.slice(4) : host;
}

/**
 * Host field as typed in a DNS panel (Mentoma Arvan style):
 * `_acme-challenge` or `_acme-challenge.www`, never the full domain.
 */
export function toDnsPanelHost(host: string, publicAddress: string): string {
  const h = stripDnsDot(host).toLowerCase();
  if (!h || h === '@') {
    return '@';
  }
  const zone = apexFromHostname(publicAddress);
  if (h === zone) {
    return '@';
  }
  const suffix = `.${zone}`;
  if (zone && h.endsWith(suffix)) {
    return h.slice(0, -suffix.length) || '@';
  }
  return stripDnsDot(host);
}

/** Same Type / Host / Value rows Mentoma uses for academy traffic. */
export function trafficDnsRows(target: string): DnsRecordRow[] {
  const value = stripDnsDot(target);
  return [
    { type: 'ANAME', name: '@', value },
    { type: 'CNAME', name: 'www', value }
  ];
}

export function toManagerAcmeRows(
  records: readonly { host: string; value: string }[],
  publicAddress: string
): DnsRecordRow[] {
  return records.map((record) => ({
    type: 'CNAME',
    name: toDnsPanelHost(record.host, publicAddress),
    value: stripDnsDot(record.value)
  }));
}
