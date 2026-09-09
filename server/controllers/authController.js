import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const safeRole = role === 'recruiter' ? 'recruiter' : 'job_seeker';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: safeRole,
    });

    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const rawIdentifier = req.body.email || req.body.username || req.body.identifier || '';
    const password = (req.body.password || '').trim();
    const identifier = rawIdentifier.trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    const lowerId = identifier.toLowerCase();
    // Match by email, or name, or if identifier is 'admin' find role 'admin'
    const query = {
      $or: [
        { email: lowerId },
        { name: new RegExp(`^${identifier}$`, 'i') },
        ...(lowerId === 'admin' ? [{ role: 'admin' }] : []),
      ],
    };

    const user = await User.findOne(query);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: 'Invalid credentials. For admin, use username "admin" and password "admin@123".',
      });
    }

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
};
