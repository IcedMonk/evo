import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, MessageData } from '../types';
import { User } from '../models/User';
import EvolutionApiService from '../services/evolutionApi';
import { io } from '../index';

// @desc    Send text message
// @route   POST /api/messages/send-text
// @access  Private
export const sendTextMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { instanceName, number, text } = req.body;
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

  // Check message limits based on subscription
  const messageLimits = {
    free: 100,
    basic: 1000,
    pro: 10000,
    enterprise: 100000
  };

  // In a real app, you'd track message usage in the database
  // For now, we'll just validate the plan

  const evolutionApi = new EvolutionApiService(user.evolutionApiKey);
  const messageData: MessageData = {
    number,
    text
  };

  const result = await evolutionApi.sendTextMessage(instanceName, messageData);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  // Emit real-time update
  io.to(userId).emit('message-sent', {
    instanceName,
    messageId: result.data?.messageId,
    status: 'sent',
    type: 'text'
  });

  res.json({
    success: true,
    data: result.data,
    message: 'Message sent successfully'
  });
});

// @desc    Send media message
// @route   POST /api/messages/send-media
// @access  Private
export const sendMediaMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { instanceName, number, media, type, caption } = req.body;
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
  const messageData: MessageData = {
    number,
    media: {
      media,
      type,
      caption
    }
  };

  const result = await evolutionApi.sendMediaMessage(instanceName, messageData);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  // Emit real-time update
  io.to(userId).emit('message-sent', {
    instanceName,
    messageId: result.data?.messageId,
    status: 'sent',
    type: 'media'
  });

  res.json({
    success: true,
    data: result.data,
    message: 'Media message sent successfully'
  });
});

// @desc    Send template message
// @route   POST /api/messages/send-template
// @access  Private
export const sendTemplateMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { instanceName, templateData } = req.body;
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
  const result = await evolutionApi.sendTemplateMessage(instanceName, templateData);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  // Emit real-time update
  io.to(userId).emit('message-sent', {
    instanceName,
    messageId: result.data?.messageId,
    status: 'sent',
    type: 'template'
  });

  res.json({
    success: true,
    data: result.data,
    message: 'Template message sent successfully'
  });
});

// @desc    Get chats for instance
// @route   GET /api/messages/:instanceName/chats
// @access  Private
export const getChats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { instanceName } = req.params;
  const { page = 1, limit = 20 } = req.query;
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
  const result = await evolutionApi.getChats(
    instanceName,
    parseInt(page as string),
    parseInt(limit as string)
  );

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

// @desc    Get messages for a chat
// @route   GET /api/messages/:instanceName/chat/:jid
// @access  Private
export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { instanceName, jid } = req.params;
  const { page = 1, limit = 50 } = req.query;
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
  const result = await evolutionApi.getMessages(
    instanceName,
    jid,
    parseInt(page as string),
    parseInt(limit as string)
  );

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

// @desc    Get groups for instance
// @route   GET /api/messages/:instanceName/groups
// @access  Private
export const getGroups = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  const result = await evolutionApi.getGroups(instanceName);

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

// @desc    Create group
// @route   POST /api/messages/:instanceName/groups
// @access  Private
export const createGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { instanceName } = req.params;
  const { groupData } = req.body;
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
  const result = await evolutionApi.createGroup(instanceName, groupData);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  // Emit real-time update
  io.to(userId).emit('group-created', {
    instanceName,
    groupId: result.data?.groupId,
    status: 'created'
  });

  res.json({
    success: true,
    data: result.data,
    message: 'Group created successfully'
  });
});

// Validation middleware
export const validateSendTextMessage = [
  body('instanceName').notEmpty().withMessage('Instance name is required'),
  body('number').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('text').isLength({ min: 1, max: 4096 }).withMessage('Message text must be between 1 and 4096 characters')
];

export const validateSendMediaMessage = [
  body('instanceName').notEmpty().withMessage('Instance name is required'),
  body('number').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('media').isURL().withMessage('Media URL is required'),
  body('type').isIn(['image', 'video', 'audio', 'document']).withMessage('Invalid media type'),
  body('caption').optional().isLength({ max: 1024 }).withMessage('Caption must be less than 1024 characters')
];

export const validateSendTemplateMessage = [
  body('instanceName').notEmpty().withMessage('Instance name is required'),
  body('templateData').isObject().withMessage('Template data is required')
];

export const validateCreateGroup = [
  body('groupData').isObject().withMessage('Group data is required'),
  body('groupData.subject').notEmpty().withMessage('Group subject is required'),
  body('groupData.participants').isArray().withMessage('Participants must be an array')
];