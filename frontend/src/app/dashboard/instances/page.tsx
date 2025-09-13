'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Settings, 
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { instanceApi } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const createInstanceSchema = z.object({
  instanceName: z.string().min(3, 'Instance name must be at least 3 characters').max(50, 'Instance name must be less than 50 characters'),
  integration: z.string().optional(),
})

type CreateInstanceForm = z.infer<typeof createInstanceSchema>

interface Instance {
  name: string
  status: 'connected' | 'disconnected' | 'connecting'
  qrcode?: string
  integration?: string
  createdAt?: string
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInstanceForm>({
    resolver: zodResolver(createInstanceSchema),
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

  const createInstance = async (data: CreateInstanceForm) => {
    setLoading(true)
    try {
      await instanceApi.create(data)
      await fetchInstances()
      setShowCreateForm(false)
      reset()
    } catch (error: any) {
      console.error('Failed to create instance:', error)
      alert(error.response?.data?.error || 'Failed to create instance')
    } finally {
      setLoading(false)
    }
  }

  const deleteInstance = async (instanceName: string) => {
    if (!confirm(`Are you sure you want to delete instance "${instanceName}"?`)) {
      return
    }

    try {
      await instanceApi.delete(instanceName)
      await fetchInstances()
    } catch (error: any) {
      console.error('Failed to delete instance:', error)
      alert(error.response?.data?.error || 'Failed to delete instance')
    }
  }

  const getQRCode = async (instanceName: string) => {
    try {
      const response = await instanceApi.getQRCode(instanceName)
      setQrCode(response.data.data?.qrcode?.base64)
      setSelectedInstance(instanceName)
    } catch (error: any) {
      console.error('Failed to get QR code:', error)
      alert(error.response?.data?.error || 'Failed to get QR code')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'connecting':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instances</h1>
          <p className="text-gray-600 mt-2">
            Manage your WhatsApp instances and connections
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Create Instance
        </Button>
      </div>

      {/* Create Instance Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Create New Instance</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(createInstance)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Instance Name"
                    placeholder="my-whatsapp-bot"
                    error={errors.instanceName?.message}
                    {...register('instanceName')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Integration
                    </label>
                    <select
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      {...register('integration')}
                    >
                      <option value="WHATSAPP-BAILEYS">WhatsApp Baileys</option>
                      <option value="WHATSAPP-WEBJS">WhatsApp WebJS</option>
                      <option value="TELEGRAM">Telegram</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" loading={loading}>
                    Create Instance
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance, index) => (
          <motion.div
            key={instance.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{instance.name}</h3>
                  </div>
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(instance.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                      {instance.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Integration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {instance.integration || 'WHATSAPP-BAILEYS'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {instance.status === 'disconnected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => getQRCode(instance.name)}
                      icon={<QrCode className="w-4 h-4" />}
                    >
                      Connect
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Settings className="w-4 h-4" />}
                  >
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteInstance(instance.name)}
                    icon={<Trash2 className="w-4 h-4" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {instances.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="text-center py-12">
              <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No instances yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first WhatsApp instance to start sending messages
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                icon={<Plus className="w-5 h-5" />}
              >
                Create Your First Instance
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* QR Code Modal */}
      {qrCode && selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Connect {selectedInstance}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your WhatsApp mobile app to connect
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setQrCode(null)
                  setSelectedInstance(null)
                }}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}