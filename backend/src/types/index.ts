import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface EvolutionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EvolutionInstance {
  instanceName: string;
  token: string;
  qrcode?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  serverUrl: string;
  apikey: string;
  integration: string;
  number?: string;
  profileName?: string;
  profilePictureUrl?: string;
}

export interface MessageData {
  number: string;
  text?: string;
  media?: {
    media: string;
    type: 'image' | 'video' | 'audio' | 'document';
    caption?: string;
  };
  options?: {
    delay?: number;
    presence?: 'composing' | 'recording' | 'paused';
  };
}

export interface WebhookData {
  url: string;
  enabled: boolean;
  events: string[];
  instanceName: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
  };
  evolutionApiKey?: string;
  instances: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxInstances: number;
  maxMessagesPerMonth: number;
  webhooks: boolean;
  apiAccess: boolean;
}