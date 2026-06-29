import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists');
    }

    const user = await User.create({ name, email, password });

    const token = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError(401, 'Invalid refresh token');
    }

    const newToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid or expired refresh token'));
    }
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const user = await User.findById(userId).select('-refreshToken');

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}
