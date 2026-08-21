/**
 * Where academy custom domains must point so traffic reaches Mentoma’s
 * Hamravesh cluster. Override in env when the cluster hostname changes.
 */
export const CUSTOM_DOMAIN_CNAME_TARGET =
  process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET ??
  'c13.hamravesh.onhamravesh.ir';
