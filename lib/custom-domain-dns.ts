/**
 * Where academy custom domains must point so traffic reaches Mentoma’s
 * Hamravesh cluster. Override in env when the cluster hostname changes.
 */
export const CUSTOM_DOMAIN_CNAME_TARGET =
  process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET ?? 'c13.hamravesh.onhamravesh.ir';

/** Where managers open their domain and add DNS rows (Arvan Cloud). */
export const ARVAN_DOMAINS_PANEL_URL = 'https://panel.arvancloud.ir/cdn/domains';

/** Cloud toggle in Arvan DNS: روشن (on) or خاموش (off). */
export type DnsCloudMode = 'on' | 'off';

export type DnsRecordRow = {
  type: string;
  /** Arvan field «عنوان» — short name only (@, www, _acme-challenge). */
  name: string;
  value: string;
  cloud: DnsCloudMode;
};

export function stripDnsDot(value: string): string {
  return value.trim().replace(/\.$/, '');
}

export function apexFromHostname(hostname: string): string {
  const host = stripDnsDot(hostname).toLowerCase();
  return host.startsWith('www.') ? host.slice(4) : host;
}

/**
 * «عنوان» as typed in Arvan: `_acme-challenge`, never the full domain.
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

/** Traffic rows: عنوان @ and www — cloud ON. */
export function trafficDnsRows(target: string): DnsRecordRow[] {
  const value = stripDnsDot(target);
  return [
    { type: 'ANAME', name: '@', value, cloud: 'on' },
    { type: 'CNAME', name: 'www', value, cloud: 'on' },
  ];
}

/** ACME rows for HTTPS — cloud OFF. */
export function toManagerAcmeRows(
  records: readonly { host: string; value: string }[],
  publicAddress: string,
): DnsRecordRow[] {
  return records.map((record) => ({
    type: 'CNAME',
    name: toDnsPanelHost(record.host, publicAddress),
    value: stripDnsDot(record.value),
    cloud: 'off' as const,
  }));
}
