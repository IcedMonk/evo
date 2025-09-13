'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, CreditCard, Zap, ArrowRight } from 'lucide-react'
import { billingApi } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string[]
  maxInstances: number
  maxMessagesPerMonth: number
  webhooks: boolean
  apiAccess: boolean
}

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string
}

export default function BillingPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await billingApi.getPlans()
      setPlans(response.data.data)
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  const fetchSubscription = async () => {
    try {
      const response = await billingApi.getSubscription()
      setSubscription(response.data.data.subscription)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return

    setLoading(true)
    try {
      const response = await billingApi.createCheckoutSession({ plan: planId })
      
      // In a real app, you would redirect to Stripe checkout
      // For demo purposes, we'll simulate the upgrade
      if (response.data.data.url) {
        // window.location.href = response.data.data.url
        alert(`In a real application, you would be redirected to Stripe checkout for ${planId} plan.`)
      }
    } catch (error: any) {
      console.error('Failed to create checkout session:', error)
      alert(error.response?.data?.error || 'Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === subscription?.plan)
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{currentPlan.name}</h4>
                    <p className="text-gray-600">
                      ${currentPlan.price}/{currentPlan.interval}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription?.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Next billing: {new Date(subscription?.currentPeriodEnd || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Usage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Usage This Month</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Instances</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.instances.length || 0} / {currentPlan?.maxInstances || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((user?.instances.length || 0) / (currentPlan?.maxInstances || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Messages</span>
                  <span className="text-sm font-medium text-gray-900">
                    0 / {currentPlan?.maxMessagesPerMonth || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-0" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Webhooks</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentPlan?.webhooks ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${currentPlan?.webhooks ? 'bg-green-600 w-full' : 'bg-gray-400 w-0'}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover>
                <CardHeader>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-1">/{plan.interval}</span>
                    </div>
                    {plan.id === subscription?.plan && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                        Current Plan
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.id === subscription?.plan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      loading={loading}
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">No payment method on file</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Add Payment Method
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Billing Address</h4>
                <div className="text-gray-600">
                  <p>{user?.firstName} {user?.lastName}</p>
                  <p>{user?.email}</p>
                  <p className="text-sm text-gray-500">No billing address on file</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Update Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}