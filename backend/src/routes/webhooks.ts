import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import EvolutionApiService from '../services/evolutionApi';

const router = express.Router();

// @desc    Set webhook for instance
// @route   POST /api/webhooks/:instanceName
// @access  Private
export const setWebhook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { instanceName } = req.params;
  const { url, enabled, events } = req.body;
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
  const webhookData = {
    url,
    enabled,
    events,
    webhook_by_events: true
  };

  const result = await evolutionApi.setWebhook(instanceName, webhookData);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    message: 'Webhook set successfully'
  });
});

// @desc    Get webhook for instance
// @route   GET /api/webhooks/:instanceName
// @access  Private
export const getWebhook = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  const result = await evolutionApi.getWebhook(instanceName);

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

// @desc    Delete webhook for instance
// @route   DELETE /api/webhooks/:instanceName
// @access  Private
export const deleteWebhook = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  const result = await evolutionApi.setWebhook(instanceName, {
    url: '',
    enabled: false,
    events: []
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }

  res.json({
    success: true,
    message: 'Webhook deleted successfully'
  });
});

// Validation middleware
const validateSetWebhook = [
  body('url').isURL().withMessage('Valid webhook URL is required'),
  body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
  body('events').isArray().withMessage('Events must be an array'),
  body('events.*').isIn([
    'APPLICATION_STARTUP',
    'QRCODE_UPDATED',
    'CONNECTION_UPDATE',
    'MESSAGES_UPSERT',
    'MESSAGES_UPDATE',
    'MESSAGES_DELETE',
    'SEND_MESSAGE',
    'CONTACTS_SET',
    'CONTACTS_UPSERT',
    'CONTACTS_UPDATE',
    'PRESENCE_UPDATE',
    'CHATS_SET',
    'CHATS_UPSERT',
    'CHATS_UPDATE',
    'CHATS_DELETE',
    'GROUPS_UPSERT',
    'GROUP_UPDATE',
    'GROUP_PARTICIPANTS_UPDATE',
    'CONNECTION_UPDATE'
  ]).withMessage('Invalid event type')
];

router.post('/:instanceName', validateSetWebhook, setWebhook);
router.get('/:instanceName', getWebhook);
router.delete('/:instanceName', deleteWebhook);

export default router;