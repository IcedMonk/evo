import express from 'express';
import {
  createInstance,
  getInstances,
  getInstance,
  getInstanceQRCode,
  deleteInstance,
  updateInstance,
  validateCreateInstance,
  validateUpdateInstance
} from '../controllers/instanceController';

const router = express.Router();

router.post('/', validateCreateInstance, createInstance);
router.get('/', getInstances);
router.get('/:instanceName', getInstance);
router.get('/:instanceName/qr', getInstanceQRCode);
router.delete('/:instanceName', deleteInstance);
router.put('/:instanceName', validateUpdateInstance, updateInstance);

export default router;