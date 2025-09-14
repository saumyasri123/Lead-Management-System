import { Router } from 'express';
import { z } from 'zod';
import { Lead } from '../models.js';
import { requireAuth } from '../middleware/auth.js';
import { buildLeadFilter } from '../lib/filter.js';

const router = Router();
router.use(requireAuth);

const sourceEnum = z.enum(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']);
const statusEnum = z.enum(['new', 'contacted', 'qualified', 'lost', 'won']);

const leadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),

  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),

  source: sourceEnum,
  status: statusEnum,

  score: z.coerce.number().int().min(0).max(100).default(0),
  lead_value: z.coerce.number().min(0).default(0),

  last_activity_at: z.preprocess(
    (v) => (v === '' || v == null ? null : v),
    z.union([z.string().datetime(), z.date()]).nullable().optional()
  ),

  is_qualified: z.coerce.boolean().optional().default(false),
});



// POST /leads (Create)
router.post('/', async (req, res, next) => {
  try {
    const parsed = leadSchema.parse(req.body);
    const lead = await Lead.create({
      ...parsed,
      last_activity_at: parsed.last_activity_at ? new Date(parsed.last_activity_at) : null,
      owner: req.user.id,
    });
    return res.status(201).json(lead);
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'Lead email must be unique' });
    if (e?.name === 'ZodError') return res.status(400).json({ error: e.errors });
    next(e);
  }
});

// GET /leads (List with pagination + filters)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limitRaw = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const limit = Math.min(limitRaw, 100);
    const filter = buildLeadFilter(req.query, req.user.id);

    const total = await Lead.countDocuments(filter);
    const data = await Lead.find(filter).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit);
    const totalPages = Math.ceil(total / limit) || 1;

    res.json({ data, page, limit, total, totalPages });
  } catch (e) { next(e); }
});

// GET /leads/:id (Single)
router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (e) { next(e); }
});

// PUT /leads/:id (Update)
router.put('/:id', async (req, res, next) => {
  try {
    const parsed = leadSchema.partial().parse(req.body);
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        ...parsed,
        ...(parsed.last_activity_at !== undefined
          ? { last_activity_at: parsed.last_activity_at ? new Date(parsed.last_activity_at) : null }
          : {}
        )
      },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'Lead email must be unique' });
    if (e?.name === 'ZodError') return res.status(400).json({ error: e.errors });
    next(e);
  }
});

// DELETE /leads/:id (Delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
