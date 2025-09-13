import express from 'express';
import {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  getChats,
  getMessages,
  getGroups,
  createGroup,
  validateSendTextMessage,
  validateSendMediaMessage,
  validateSendTemplateMessage,
  validateCreateGroup
} from '../controllers/messageController';

const router = express.Router();

// Message sending routes
router.post('/send-text', validateSendTextMessage, sendTextMessage);
router.post('/send-media', validateSendMediaMessage, sendMediaMessage);
router.post('/send-template', validateSendTemplateMessage, sendTemplateMessage);

// Chat and message retrieval routes
router.get('/:instanceName/chats', getChats);
router.get('/:instanceName/chat/:jid', getMessages);

// Group management routes
router.get('/:instanceName/groups', getGroups);
router.post('/:instanceName/groups', validateCreateGroup, createGroup);

export default router;