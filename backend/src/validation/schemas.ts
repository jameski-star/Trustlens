import { z } from 'zod';

export const scanSchema = z.object({
  input: z.string().min(1, 'Input is required').max(2000, 'Input too long'),
  type: z.enum(['url', 'email', 'sms', 'phone', 'screenshot', 'qrcode']).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const communityReportSchema = z.object({
  type: z.enum(['url', 'email', 'phone', 'whatsapp', 'crypto', 'investment']),
  target: z.string().min(1, 'Target is required').max(500),
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(10, 'Description is required').max(5000),
  category: z.string().min(1, 'Category is required'),
});

export const blogPostSchema = z.object({
  title: z.string().min(5, 'Title is required').max(200),
  slug: z.string().min(3, 'Slug is required').max(200),
  excerpt: z.string().min(10, 'Excerpt is required').max(500),
  content: z.string().min(100, 'Content is required'),
  coverImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  isPublished: z.boolean().optional(),
});
