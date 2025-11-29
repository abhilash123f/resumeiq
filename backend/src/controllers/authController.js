import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Match from '../models/Match.js';
import config from '../config.js';
import fs from 'fs/promises';
import path from 'path';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0],
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get all user's resumes to delete files
    const resumes = await Resume.find({ userId });
    
    // Delete resume files
    for (const resume of resumes) {
      if (resume.filePath) {
        try {
          await fs.unlink(resume.filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }
    
    // Delete all user data
    await Resume.deleteMany({ userId });
    await Match.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Account and all data deleted successfully' });
  } catch (error) {
    next(error);
  }
};
