import User from '../models/AuthUser.js';
import bcrypt from 'bcryptjs';    
import jwt from 'jsonwebtoken';    

export const signup = async (req, res) => {
  const { name, emailid, password, dateofbirth, dateofjoining } = req.body;

  try {
    const existingUser = await User.findOne({ emailid });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      emailid,
      password: hashedPassword,
      dateOfBirth: dateofbirth,
      dateOfJoining: dateofjoining,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    console.error("Signup error:", error.message, error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  const { emailid, password } = req.body;

  try {
    const user = await User.findOne({ emailid });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error("Login error:", error.message, error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile data', user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user data', error: error.message });
  }
};
