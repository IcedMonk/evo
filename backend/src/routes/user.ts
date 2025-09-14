import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { User } from '../models/User';

const router = express.Router();

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { firstName, lastName, evolutionApiKey } = req.body;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (evolutionApiKey !== undefined) user.evolutionApiKey = evolutionApiKey;

  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscription: user.subscription,
        instances: user.instances
      }
    },
    message: 'Profile updated successfully'
  });
});

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const stats = {
    totalInstances: user.instances.length,
    subscription: user.subscription,
    createdAt: user.createdAt,
    planLimits: {
      free: { instances: 1, messages: 100 },
      basic: { instances: 3, messages: 1000 },
      pro: { instances: 10, messages: 10000 },
      enterprise: { instances: 50, messages: 100000 }
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

// Validation middleware
const validateUpdateProfile = [
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('evolutionApiKey').optional().isLength({ min: 10 }).withMessage('Evolution API key must be at least 10 characters')
];

router.put('/profile', validateUpdateProfile, updateProfile);
router.get('/stats', getUserStats);

export default router;