import type { TicketMessage } from './staff-support-types';

export function ticketEventText(
  m: TicketMessage,
  t: (k: string) => string
): string {
  const meta = m.system_meta ?? {};
  const fill = (k: string) =>
    t(k)
      .replace('{from}', meta.from_name ?? '—')
      .replace('{to}', meta.to_name ?? '—')
      .replace('{by}', meta.by_name ?? '—')
      .replace('{status}', meta.status ?? '—');

  switch (m.system_event_type) {
    case 'reassigned':
      return meta.from_name
        ? fill('support.responsibleChanged')
        : fill('support.responsibleAssigned');
    case 'call_logged':
      return fill('support.events.callLogged');
    case 'email_logged':
      return fill('support.events.emailLogged');
    case 'call_requested':
      return t('support.callRequested');
    default:
      return m.body || t('support.events.system');
  }
}
