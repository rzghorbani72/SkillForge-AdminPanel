export interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  delta?: number | null;
  accent?: boolean;
  negative?: boolean;
}
