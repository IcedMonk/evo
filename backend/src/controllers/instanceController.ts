import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import EvolutionApiService from '../services/evolutionApi';
import { io } from '../index';

// @desc    Create new instance
// @route   POST /api/instances
// @access  Private
export const createInstance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { instanceName, integration } = req.body;
  const userId = req.user?.id;

  // Check if user exists and get their API key
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Check subscription limits
  const planLimits = {
    free: 1,
    basic: 3,
    pro: 10,
    enterprise: 50
  };

  const currentInstanceCount = user.instances.length;
  const maxInstances = planLimits[user.subscription.plan as keyof typeof planLimits];

  if (currentInstanceCount >= maxInstances) {
    return res.status(403).json({
      success: false,
      error: `Instance limit reached for ${user.subscription.plan} plan. Maximum: ${maxInstances}`
    });
  }

  // Create Evolution API service instance
  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  
  // Create instance
  const result = await evolutionApi.createInstance(instanceName, integration);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  // Add instance to user's instances array
  user.instances.push(instanceName);
  await user.save();

  // Emit real-time update
  if (userId) {
    io.to(userId).emit('instance-created', {
      instanceName,
      status: 'created',
      data: result.data
    });
  }

  res.status(201).json({
    success: true,
    data: {
      instanceName,
      integration,
      status: 'created',
      details: result.data
    },
    message: 'Instance created successfully'
  });
});

// @desc    Get all instances for user
// @route   GET /api/instances
// @access  Private
export const getInstances = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  const instances = [];

  // Get details for each instance
  for (const instanceName of user.instances) {
    const instanceResult = await evolutionApi.getInstance(instanceName);
    if (instanceResult.success) {
      instances.push({
        name: instanceName,
        ...instanceResult.data
      });
    }
  }

  res.json({
    success: true,
    data: instances
  });
});

// @desc    Get specific instance
// @route   GET /api/instances/:instanceName
// @access  Private
export const getInstance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { instanceName } = req.params;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Check if user owns this instance
  if (!user.instances.includes(instanceName)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this instance'
    });
  }

  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  const result = await evolutionApi.getInstance(instanceName);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  res.json({
    success: true,
    data: {
      name: instanceName,
      ...result.data
    }
  });
});

// @desc    Get QR code for instance
// @route   GET /api/instances/:instanceName/qr
// @access  Private
export const getInstanceQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { instanceName } = req.params;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (!user.instances.includes(instanceName)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this instance'
    });
  }

  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  const result = await evolutionApi.getInstanceQRCode(instanceName);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  res.json({
    success: true,
    data: result.data
  });
});

// @desc    Delete instance
// @route   DELETE /api/instances/:instanceName
// @access  Private
export const deleteInstance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { instanceName } = req.params;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (!user.instances.includes(instanceName)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this instance'
    });
  }

  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  const result = await evolutionApi.deleteInstance(instanceName);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  // Remove instance from user's instances array
  user.instances = user.instances.filter(instance => instance !== instanceName);
  await user.save();

  // Emit real-time update
  if (userId) {
    io.to(userId).emit('instance-deleted', {
      instanceName,
      status: 'deleted'
    });
  }

  res.json({
    success: true,
    message: 'Instance deleted successfully'
  });
});

// @desc    Update instance settings
// @route   PUT /api/instances/:instanceName
// @access  Private
export const updateInstance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { instanceName } = req.params;
  const { profileName, profilePictureUrl } = req.body;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (!user.instances.includes(instanceName)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this instance'
    });
  }

  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  let results = [];

  // Update profile name if provided
  if (profileName) {
    const nameResult = await evolutionApi.updateProfile(instanceName, { name: profileName });
    results.push({ type: 'profileName', result: nameResult });
  }

  // Update profile picture if provided
  if (profilePictureUrl) {
    const pictureResult = await evolutionApi.updateProfilePicture(instanceName, profilePictureUrl);
    results.push({ type: 'profilePicture', result: pictureResult });
  }

  // Check if any updates failed
  const failedUpdates = results.filter(r => !r.result.success);
  if (failedUpdates.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Some updates failed',
      details: failedUpdates
    });
  }

  // Emit real-time update
  if (userId) {
    io.to(userId).emit('instance-updated', {
      instanceName,
      updates: results.map(r => ({ type: r.type, success: true }))
    });
  }

  res.json({
    success: true,
    message: 'Instance updated successfully',
    data: results
  });
});

// Validation middleware
export const validateCreateInstance = [
  body('instanceName')
    .isLength({ min: 3, max: 50 })
    .withMessage('Instance name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Instance name can only contain letters, numbers, underscores, and hyphens'),
  body('integration')
    .optional()
    .isIn(['WHATSAPP-BAILEYS', 'WHATSAPP-WEBJS', 'TELEGRAM'])
    .withMessage('Invalid integration type')
];

export const validateUpdateInstance = [
  body('profileName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Profile name must be between 1 and 100 characters'),
  body('profilePictureUrl')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
];