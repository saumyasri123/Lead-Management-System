import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models.js';

const router = Router();

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIE === '1';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: (parseInt(process.env.JWT_EXPIRES_DAYS || '7', 10)) * 24 * 60 * 60 * 1000,
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: `${process.env.JWT_EXPIRES_DAYS || 7}d`,
    });
    setAuthCookie(res, token);
    return res.status(201).json({ id: user._id, email: user.email });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: `${process.env.JWT_EXPIRES_DAYS || 7}d`,
    });
    setAuthCookie(res, token);
    return res.json({ id: user._id, email: user.email });
  } catch (e) { next(e); }
});

router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax',  path: '/' });
  res.status(204).end();
});

router.get('/me', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ id: payload.sub, email: payload.email });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;
