import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { User } from '../models/User';

const router = express.Router();

// Subscription plans
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '1 WhatsApp instance',
      '100 messages/month',
      'Basic support',
      'Standard templates'
    ],
    maxInstances: 1,
    maxMessagesPerMonth: 100,
    webhooks: false,
    apiAccess: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      '3 WhatsApp instances',
      '1,000 messages/month',
      'Priority support',
      'Custom templates',
      'Basic analytics'
    ],
    maxInstances: 3,
    maxMessagesPerMonth: 1000,
    webhooks: true,
    apiAccess: true
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      '10 WhatsApp instances',
      '10,000 messages/month',
      '24/7 support',
      'Advanced templates',
      'Advanced analytics',
      'Webhook management',
      'API access'
    ],
    maxInstances: 10,
    maxMessagesPerMonth: 10000,
    webhooks: true,
    apiAccess: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    currency: 'USD',
    interval: 'month',
    features: [
      '50 WhatsApp instances',
      '100,000 messages/month',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'Webhook management',
      'Full API access',
      'Custom branding'
    ],
    maxInstances: 50,
    maxMessagesPerMonth: 100000,
    webhooks: true,
    apiAccess: true
  }
};

// @desc    Get subscription plans
// @route   GET /api/billing/plans
// @access  Public
export const getPlans = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(SUBSCRIPTION_PLANS)
  });
});

// @desc    Get current subscription
// @route   GET /api/billing/subscription
// @access  Private
export const getSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const currentPlan = SUBSCRIPTION_PLANS[user.subscription.plan as keyof typeof SUBSCRIPTION_PLANS];

  res.json({
    success: true,
    data: {
      subscription: user.subscription,
      plan: currentPlan,
      usage: {
        instances: user.instances.length,
        // In a real app, you'd track actual message usage
        messagesThisMonth: 0
      }
    }
  });
});

// @desc    Update subscription plan
// @route   PUT /api/billing/subscription
// @access  Private
export const updateSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { plan } = req.body;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Validate plan exists
  if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription plan'
    });
  }

  // Check if user has too many instances for the new plan
  const newPlan = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
  if (user.instances.length > newPlan.maxInstances) {
    return res.status(400).json({
      success: false,
      error: `Cannot downgrade to ${plan} plan. You have ${user.instances.length} instances, but the plan allows only ${newPlan.maxInstances}. Please delete some instances first.`
    });
  }

  // Update subscription
  user.subscription.plan = plan as any;
  user.subscription.status = 'active';
  user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  await user.save();

  res.json({
    success: true,
    data: {
      subscription: user.subscription,
      plan: newPlan
    },
    message: 'Subscription updated successfully'
  });
});

// @desc    Create checkout session (Stripe integration)
// @route   POST /api/billing/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { plan } = req.body;
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // In a real implementation, you would integrate with Stripe here
  // For now, we'll simulate the checkout process
  
  if (plan === 'free') {
    // Free plan - no payment needed
    user.subscription.plan = 'free';
    user.subscription.status = 'active';
    await user.save();

    return res.json({
      success: true,
      data: {
        sessionId: null,
        url: null,
        plan: 'free'
      },
      message: 'Free plan activated successfully'
    });
  }

  const selectedPlan = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
  if (!selectedPlan) {
    return res.status(400).json({
      success: false,
      error: 'Invalid plan selected'
    });
  }

  // In a real app, create Stripe checkout session
  // For demo purposes, we'll return a mock session
  res.json({
    success: true,
    data: {
      sessionId: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
      plan: selectedPlan
    },
    message: 'Checkout session created successfully'
  });
});

// @desc    Handle webhook from payment provider
// @route   POST /api/billing/webhook
// @access  Public (but should verify webhook signature)
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, you would verify the webhook signature
  // and handle the payment confirmation from Stripe
  
  // Parse the request body as a Stripe event
  const event = req.body as { type?: string; data?: any };

  if (event && event.type === 'checkout.session.completed') {
    // Handle successful payment
    console.log('Payment successful:', event.data);
  }

  res.json({ received: true });
});

// Validation middleware
const validateUpdateSubscription = [
  body('plan').isIn(['free', 'basic', 'pro', 'enterprise']).withMessage('Invalid subscription plan')
];

const validateCreateCheckoutSession = [
  body('plan').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid plan for checkout')
];

router.get('/plans', getPlans);
router.get('/subscription', getSubscription);
router.put('/subscription', validateUpdateSubscription, updateSubscription);
router.post('/create-checkout-session', validateCreateCheckoutSession, createCheckoutSession);
router.post('/webhook', handleWebhook);

export default router;