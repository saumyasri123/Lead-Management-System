import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const defaults = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  state: '',
  source: 'website',
  status: 'new',
  score: 0,
  lead_value: 0,
  last_activity_at: '', 
  is_qualified: false,
};

export default function LeadForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm({ defaultValues: defaults });

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/leads/${id}`)
      .then(({ data }) => {
        const mapped = {
          ...data,
          last_activity_at: data.last_activity_at
            ? data.last_activity_at.substring(0, 16)
            : '',
        };
        reset(mapped);
      })
      .catch((e) => {
        if (e?.response?.status === 401) navigate('/login');
        else alert(e?.response?.data?.error || 'Failed to load');
      });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (v) => {
    const payload = {
      ...v,
      score: Number.isFinite(v.score) ? v.score : 0,
      lead_value: Number.isFinite(parseFloat(v.lead_value))
        ? parseFloat(v.lead_value) : 0,
      last_activity_at: v.last_activity_at
        ? new Date(v.last_activity_at).toISOString() : null,
    };

    try {
      if (isEdit) await api.put(`/leads/${id}`, payload);
      else await api.post('/leads', payload);
      navigate('/');
    } catch (e) {
      const msg = e?.response?.data?.error;
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg ?? 'Save failed'));
      if (e?.response?.status === 401) navigate('/login');
    }
  };


  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>{isEdit ? 'Edit Lead' : 'New Lead'}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={row}>
            <div style={col}>
              <label>First name</label>
              <input style={input} {...register('first_name', { required: true })} />
            </div>
            <div style={col}>
              <label>Last name</label>
              <input style={input} {...register('last_name', { required: true })} />
            </div>
          </div>

          <div style={row}>
            <div style={col}>
              <label>Email</label>
              <input type="email" style={input} {...register('email', { required: true })} />
            </div>
            <div style={col}>
              <label>Phone</label>
              <input style={input} {...register('phone')} />
            </div>
          </div>

          <div style={row}>
            <div style={col}>
              <label>Company</label>
              <input style={input} {...register('company')} />
            </div>
            <div style={col}>
              <label>City</label>
              <input style={input} {...register('city')} />
            </div>
          </div>

          <div style={row}>
            <div style={col}>
              <label>State</label>
              <input style={input} {...register('state')} />
            </div>
            <div style={col}>
              <label>Source</label>
              <select style={input} {...register('source')}>
                <option>website</option>
                <option>facebook_ads</option>
                <option>google_ads</option>
                <option>referral</option>
                <option>events</option>
                <option>other</option>
              </select>
            </div>
          </div>

          <div style={row}>
            <div style={col}>
              <label>Status</label>
              <select style={input} {...register('status')}>
                <option>new</option>
                <option>contacted</option>
                <option>qualified</option>
                <option>lost</option>
                <option>won</option>
              </select>
            </div>
            <div style={col}>
              <label>Score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                style={input}
                {...register('score', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div style={row}>
            <div style={col}>
              <label>Lead value</label>
              <input
                type="number"
                step="0.01"
                min="0"
                style={input}
                {...register('lead_value', { valueAsNumber: true })}
              />
            </div>
            <div style={col}>
              <label>Last activity</label>
              <input type="datetime-local" style={input} {...register('last_activity_at')} />
            </div>
          </div>

          <div style={{ marginTop: '.5rem' }}>
            <label>
              <input type="checkbox" {...register('is_qualified')} /> Qualified
            </label>
          </div>

          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
            <button type="submit" style={btnPrimary}>Save</button>
            <button type="button" style={btn} onClick={() => navigate('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const row = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '.75rem', marginTop: '.5rem' };
const col = {};
const input = { width: '100%', padding: '.5rem .6rem', border: '1px solid #ddd', borderRadius: 8 };
const btn = { padding: '.45rem .8rem', border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' };
const btnPrimary = { ...btn, background: '#2563eb', borderColor: '#2563eb', color: '#fff' };
