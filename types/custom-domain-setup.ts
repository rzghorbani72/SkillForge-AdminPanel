export type DomainSetupActor = 'manager' | 'platform';

export type AcmeDnsRecord = {
  host: string;
  value: string;
};

export type CustomDomainSetupState = {
  hamravesh_attached: boolean;
  hamravesh_attached_at: string | null;
  hamravesh_hostname: string | null;
  acme_records: AcmeDnsRecord[];
  acme_confirmed: boolean;
  acme_confirmed_at: string | null;
  ssl_confirmed: boolean;
  ssl_confirmed_at: string | null;
  dns_verified: boolean;
  dns_verified_at: string | null;
  dns_resolved_to: string | null;
};

export type CustomDomainSetupResponse = {
  academy_id: string;
  academy_name: string;
  public_address: string | null;
  private_address: string;
  cname_target: string;
  ssl_enabled: boolean;
  setup: CustomDomainSetupState;
  steps: Record<string, { done: boolean; actor: DomainSetupActor }>;
};

export type VerifyDnsResponse = {
  ok: boolean;
  host: string;
  expected_target: string;
  resolved_to: string | null;
  setup: CustomDomainSetupState;
  steps: CustomDomainSetupResponse['steps'];
};
