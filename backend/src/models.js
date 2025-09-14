import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const leadSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: String,
    company: String,
    city: String,
    state: String,
    source: { type: String, enum: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'], required: true },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'lost', 'won'], required: true },
    score: { type: Number, min: 0, max: 100, default: 0 },
    lead_value: { type: Number, default: 0 },
    last_activity_at: { type: Date, default: null },
    is_qualified: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const User = mongoose.model('User', userSchema);
export const Lead = mongoose.model('Lead', leadSchema);
