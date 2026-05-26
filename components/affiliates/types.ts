import { z } from 'zod';

export type Course = { id: number; title: string; price: number };

export type Affiliate = {
  id: number;
  code: string;
  affiliate_name: string;
  affiliate_email?: string | null;
  affiliate_phone?: string | null;
  commission_rate: number;
  is_active: boolean;
  clicks: number;
  course_id?: number | null;
  academy_id: number;
  course?: Course | null;
  Usages?: Array<{ commission_amount: number; created_at?: string }>;
  signups?: number;
  sales?: number;
  revenue?: number;
  status?: 'active' | 'top' | 'pending' | 'inactive';
};

export const addAffiliateSchema = z.object({
  affiliate_name: z.string().min(2, 'Name required'),
  phone: z.string().min(7, 'Phone required'),
  code: z.string().optional(),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  commission_pct: z.coerce.number().min(1).max(100)
});

export type AddAffiliateForm = z.infer<typeof addAffiliateSchema>;
