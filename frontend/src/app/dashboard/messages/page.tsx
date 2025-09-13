'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Image, 
  FileText, 
  Phone,
  MessageSquare,
  Paperclip,
  Smile,
  X
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { messageApi, instanceApi } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const sendMessageSchema = z.object({
  instanceName: z.string().min(1, 'Instance is required'),
  number: z.string().min(1, 'Phone number is required'),
  text: z.string().min(1, 'Message text is required'),
})

const sendMediaSchema = z.object({
  instanceName: z.string().min(1, 'Instance is required'),
  number: z.string().min(1, 'Phone number is required'),
  media: z.string().url('Valid media URL is required'),
  type: z.enum(['image', 'video', 'audio', 'document']),
  caption: z.string().optional(),
})

type SendMessageForm = z.infer<typeof sendMessageSchema>
type SendMediaForm = z.infer<typeof sendMediaSchema>

interface Instance {
  name: string
  status: string
}

interface Message {
  id: string
  text: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  type: 'text' | 'media'
}

export default function MessagesPage() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<'text' | 'media'>('text')
  const [loading, setLoading] = useState(false)

  const textForm = useForm<SendMessageForm>({
    resolver: zodResolver(sendMessageSchema),
  })

  const mediaForm = useForm<SendMediaForm>({
    resolver: zodResolver(sendMediaSchema),
  })

  useEffect(() => {
    fetchInstances()
  }, [])

  const fetchInstances = async () => {
    try {
      const response = await instanceApi.getAll()
      setInstances(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch instances:', error)
    }
  }

  const sendTextMessage = async (data: SendMessageForm) => {
    setLoading(true)
    try {
      const response = await messageApi.sendText(data)
      
      // Add to messages list
      setMessages(prev => [{
        id: Date.now().toString(),
        text: data.text,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      }, ...prev])
      
      textForm.reset()
    } catch (error: any) {
      console.error('Failed to send message:', error)
      alert(error.response?.data?.error || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const sendMediaMessage = async (data: SendMediaForm) => {
    setLoading(true)
    try {
      const response = await messageApi.sendMedia(data)
      
      // Add to messages list
      setMessages(prev => [{
        id: Date.now().toString(),
        text: data.caption || `Media (${data.type})`,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'media'
      }, ...prev])
      
      mediaForm.reset()
    } catch (error: any) {
      console.error('Failed to send media message:', error)
      alert(error.response?.data?.error || 'Failed to send media message')
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Add country code if not present
    if (digits.length === 10) {
      return `+1${digits}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    } else if (digits.startsWith('+')) {
      return phone
    } else {
      return `+${digits}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Send text messages and media through your WhatsApp instances
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Message Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'text'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Text Message
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'media'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Image className="w-4 h-4 inline mr-2" />
                  Media Message
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'text' ? (
                <form onSubmit={textForm.handleSubmit(sendTextMessage)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instance
                      </label>
                      <select
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...textForm.register('instanceName')}
                      >
                        <option value="">Select an instance</option>
                        {instances.map((instance) => (
                          <option key={instance.name} value={instance.name}>
                            {instance.name} ({instance.status})
                          </option>
                        ))}
                      </select>
                      {textForm.formState.errors.instanceName && (
                        <p className="mt-1 text-sm text-red-600">
                          {textForm.formState.errors.instanceName.message}
                        </p>
                      )}
                    </div>
                    <Input
                      label="Phone Number"
                      placeholder="+1234567890"
                      icon={<Phone className="w-4 h-4" />}
                      error={textForm.formState.errors.number?.message}
                      {...textForm.register('number')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={4}
                      placeholder="Type your message here..."
                      {...textForm.register('text')}
                    />
                    {textForm.formState.errors.text && (
                      <p className="mt-1 text-sm text-red-600">
                        {textForm.formState.errors.text.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                    <Button
                      type="submit"
                      loading={loading}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={mediaForm.handleSubmit(sendMediaMessage)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instance
                      </label>
                      <select
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...mediaForm.register('instanceName')}
                      >
                        <option value="">Select an instance</option>
                        {instances.map((instance) => (
                          <option key={instance.name} value={instance.name}>
                            {instance.name} ({instance.status})
                          </option>
                        ))}
                      </select>
                      {mediaForm.formState.errors.instanceName && (
                        <p className="mt-1 text-sm text-red-600">
                          {mediaForm.formState.errors.instanceName.message}
                        </p>
                      )}
                    </div>
                    <Input
                      label="Phone Number"
                      placeholder="+1234567890"
                      icon={<Phone className="w-4 h-4" />}
                      error={mediaForm.formState.errors.number?.message}
                      {...mediaForm.register('number')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Media URL"
                      placeholder="https://example.com/image.jpg"
                      icon={<Image className="w-4 h-4" />}
                      error={mediaForm.formState.errors.media?.message}
                      {...mediaForm.register('media')}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media Type
                      </label>
                      <select
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...mediaForm.register('type')}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="document">Document</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Caption (Optional)"
                    placeholder="Add a caption to your media..."
                    icon={<FileText className="w-4 h-4" />}
                    error={mediaForm.formState.errors.caption?.message}
                    {...mediaForm.register('caption')}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={loading}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send Media
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 5).map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        message.status === 'sent' ? 'bg-blue-500' :
                        message.status === 'delivered' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{message.text}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}