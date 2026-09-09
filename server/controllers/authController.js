import { registerUser, loginUser, getMe } from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const result = await registerUser({
      name,
      email,
      password,
      studentId,
      role: 'student',
    });

    res.status(201).json({
      success: true,
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const result = await loginUser(email, password, role);

    res.status(200).json({
      success: true,
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getMe(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
