// backend/scripts/seed.js (ESM)
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { User, Lead } from '../src/models.js';

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in .env');

  await mongoose.connect(uri);
  console.log('Mongo connected (seed)'); // mongoose.connect() is the supported way. :contentReference[oaicite:1]{index=1}

  const email = process.env.SEED_USER_EMAIL || 'test@erino.dev';
  const plain = process.env.SEED_USER_PASSWORD || 'Test@1234';
  const hash = await bcrypt.hash(plain, 10);

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, password: hash });
  console.log('Seed user:', email, '/', plain);

  const count = parseInt(process.env.SEED_LEADS || '150', 10);
  const sources = ['website','facebook_ads','google_ads','referral','events','other'];
  const statuses = ['new','contacted','qualified','lost','won'];

  const ops = [];
  for (let i = 0; i < count; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const leadEmail = faker.internet.email({ firstName: first, lastName: last }).toLowerCase();

    ops.push({
      insertOne: {
        document: {
          first_name: first,
          last_name: last,
          email: `${i}_${leadEmail}`,
          phone: faker.phone.number(),
          company: faker.company.name(),
          city: faker.location.city(),
          state: faker.location.state(),
          source: faker.helpers.arrayElement(sources),
          status: faker.helpers.arrayElement(statuses),
          score: faker.number.int({ min: 0, max: 100 }),
          lead_value: faker.number.float({ min: 0, max: 10000, precision: 0.01 }),
          last_activity_at: faker.date.between({ from: new Date(Date.now() - 365*24*60*60*1000), to: new Date() }),
          is_qualified: faker.datatype.boolean(),
          owner: user._id,
        }
      }
    });
  }

  if (ops.length) {
    try {
      await Lead.bulkWrite(ops, { ordered: false });
      console.log(`Seeded ${count} leads`);
    } catch {
      console.log('Bulk insert finished (some duplicates possible on reseed).');
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
