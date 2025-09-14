export function buildLeadFilter(q, ownerId) {
  const filter = { owner: ownerId };

  // String equals/contains (case-insensitive)
  for (const f of ['email', 'company', 'city']) {
    if (q[f]) filter[f] = { $regex: `^${escapeRegex(q[f])}$`, $options: 'i' };
    if (q[`${f}_contains`]) filter[f] = { $regex: escapeRegex(q[`${f}_contains`]), $options: 'i' };
  }

  // Enums
  if (q.status) filter.status = q.status;
  if (q.status_in) filter.status = { $in: String(q.status_in).split(',') };
  if (q.source) filter.source = q.source;
  if (q.source_in) filter.source = { $in: String(q.source_in).split(',') };

  // Numbers
  for (const f of ['score', 'lead_value']) {
    if (q[f] !== undefined) filter[f] = Number(q[f]);
    const gt = q[`${f}_gt`]; const lt = q[`${f}_lt`]; const between = q[`${f}_between`];
    if (gt || lt) filter[f] = { ...(filter[f] || {}), ...(gt ? { $gt: Number(gt) } : {}), ...(lt ? { $lt: Number(lt) } : {}) };
    if (between) {
      const [a, b] = String(between).split(',').map(Number);
      if (!Number.isNaN(a) && !Number.isNaN(b)) filter[f] = { $gte: Math.min(a, b), $lte: Math.max(a, b) };
    }
  }

  // Dates
  for (const f of ['created_at', 'last_activity_at']) {
    const on = q[`${f}_on`], before = q[`${f}_before`], after = q[`${f}_after`], between = q[`${f}_between`];
    if (on)  { const s = new Date(on); const e = new Date(on); e.setHours(23,59,59,999); filter[f] = { $gte: s, $lte: e }; }
    if (before) filter[f] = { ...(filter[f] || {}), $lt: new Date(before) };
    if (after)  filter[f] = { ...(filter[f] || {}), $gt: new Date(after) };
    if (between) {
      const [a, b] = String(between).split(',').map((s) => new Date(s));
      if (!isNaN(a) && !isNaN(b)) filter[f] = { $gte: a < b ? a : b, $lte: a < b ? b : a };
    }
  }

  // Boolean
  if (q.is_qualified !== undefined) {
    const v = String(q.is_qualified).toLowerCase();
    if (['true', 'false'].includes(v)) filter.is_qualified = (v === 'true');
  }

  return filter;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
