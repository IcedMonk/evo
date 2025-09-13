import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EvolutionAPIResponse, EvolutionInstance, MessageData } from '../types';

class EvolutionApiService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor(apiKey?: string, serverUrl?: string) {
    this.baseUrl = serverUrl || process.env.EVOLUTION_API_URL || 'https://evo.wcpilot.me';
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey || process.env.EVOLUTION_API_KEY || '',
        'Authorization': `Bearer ${apiKey || process.env.EVOLUTION_API_KEY || ''}`
      }
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 Evolution API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Evolution API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ Evolution API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('Evolution API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Instance Management
  async createInstance(instanceName: string, integration: string = 'WHATSAPP-BAILEYS'): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.post(`/instance/create`, {
        instanceName,
        integration,
        token: `${instanceName}_token_${Date.now()}`
      });

      return {
        success: true,
        data: response.data,
        message: 'Instance created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create instance'
      };
    }
  }

  async getInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/instance/connectionState/${instanceName}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get instance'
      };
    }
  }

  async getInstanceQRCode(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/instance/connect/${instanceName}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get QR code'
      };
    }
  }

  async deleteInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.delete(`/instance/delete/${instanceName}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Instance deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete instance'
      };
    }
  }

  async getAllInstances(): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/instance/fetchInstances`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get instances'
      };
    }
  }

  // Messaging
  async sendTextMessage(instanceName: string, messageData: MessageData): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.post(`/message/sendText/${instanceName}`, {
        number: messageData.number,
        textMessage: {
          text: messageData.text
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Message sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send message'
      };
    }
  }

  async sendMediaMessage(instanceName: string, messageData: MessageData): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.post(`/message/sendMedia/${instanceName}`, {
        number: messageData.number,
        mediaMessage: {
          media: messageData.media?.media,
          type: messageData.media?.type,
          caption: messageData.media?.caption
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Media message sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send media message'
      };
    }
  }

  async sendTemplateMessage(instanceName: string, templateData: any): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.post(`/message/sendTemplate/${instanceName}`, templateData);

      return {
        success: true,
        data: response.data,
        message: 'Template message sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send template message'
      };
    }
  }

  // Webhook Management
  async setWebhook(instanceName: string, webhookData: any): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.post(`/webhook/set/${instanceName}`, webhookData);

      return {
        success: true,
        data: response.data,
        message: 'Webhook set successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to set webhook'
      };
    }
  }

  async getWebhook(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/webhook/find/${instanceName}`);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get webhook'
      };
    }
  }

  // Chat Management
  async getChats(instanceName: string, page: number = 1, limit: number = 20): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/chat/findChats/${instanceName}`, {
        params: { page, limit }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get chats'
      };
    }
  }

  async getMessages(instanceName: string, jid: string, page: number = 1, limit: number = 20): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/chat/findMessages/${instanceName}`, {
        params: { jid, page, limit }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get messages'
      };
    }
  }

  // Group Management
  async createGroup(instanceName: string, groupData: any): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.post(`/group/create/${instanceName}`, groupData);

      return {
        success: true,
        data: response.data,
        message: 'Group created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create group'
      };
    }
  }

  async getGroups(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.get(`/group/findGroups/${instanceName}`);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get groups'
      };
    }
  }

  // Profile Management
  async updateProfile(instanceName: string, profileData: any): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.put(`/chat/updateProfileName/${instanceName}`, profileData);

      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile'
      };
    }
  }

  async updateProfilePicture(instanceName: string, imageUrl: string): Promise<EvolutionAPIResponse> {
    try {
      const response: AxiosResponse = await this.api.put(`/chat/updateProfilePicture/${instanceName}`, {
        url: imageUrl
      });

      return {
        success: true,
        data: response.data,
        message: 'Profile picture updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile picture'
      };
    }
  }
}

export default EvolutionApiService;