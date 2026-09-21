import { z } from 'zod';

export const lineItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Title required').max(120),
  description: z.string().max(500).default(''),
  qty: z.coerce.number().min(0).max(100000),
  rate: z.coerce.number().min(0).max(100000000),
  amount: z.coerce.number().min(0),
});

export const partySchema = z.object({
  name: z.string().max(120),
  email: z.string().max(120).refine((v) => v === '' || /.+@.+\..+/.test(v), 'Invalid email'),
  address: z.string().max(300),
});

export const invoiceSchema = z.object({
  invoiceNo: z.string().min(1).max(40),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  currency: z.enum(['USD','EUR','GBP','INR','JPY','CAD','AUD','AED','NGN','BRL']),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex'),
  from: partySchema,
  billTo: partySchema,
  items: z.array(lineItemSchema).min(1, 'Add at least one line item'),
  taxRate: z.coerce.number().min(0).max(60),
  discountRate: z.coerce.number().min(0).max(90),
  discountFlat: z.coerce.number().min(0),
  lateFeeRate: z.coerce.number().min(0).max(30),
  poNumber: z.string().max(60),
  taxId: z.string().max(60),
  paymentTerms: z.string().max(300),
  paymentLink: z.string().max(500),
  notes: z.string().max(2000),
});

export const aiPromptSchema = z
  .string()
  .trim()
  .min(8, 'Describe your invoice in a few more words…')
  .max(2000);

export type InvoiceValidated = z.infer<typeof invoiceSchema>;
