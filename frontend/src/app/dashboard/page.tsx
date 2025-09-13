'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, MessageSquare, Users, BarChart3, TrendingUp, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const stats = [
  {
    name: 'Total Instances',
    value: '0',
    change: '+0%',
    changeType: 'positive',
    icon: Zap,
  },
  {
    name: 'Messages Sent',
    value: '0',
    change: '+0%',
    changeType: 'positive',
    icon: MessageSquare,
  },
  {
    name: 'Active Chats',
    value: '0',
    change: '+0%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Response Rate',
    value: '0%',
    change: '+0%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

const recentActivities = [
  {
    id: 1,
    type: 'instance',
    message: 'Instance "main-bot" connected successfully',
    time: '2 minutes ago',
    icon: Zap,
    color: 'text-green-600',
  },
  {
    id: 2,
    type: 'message',
    message: 'Message sent to +1234567890',
    time: '5 minutes ago',
    icon: MessageSquare,
    color: 'text-blue-600',
  },
  {
    id: 3,
    type: 'webhook',
    message: 'Webhook endpoint updated',
    time: '1 hour ago',
    icon: Users,
    color: 'text-purple-600',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your Evolution API instances today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/instances">
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="w-5 h-5 mr-2" />
                  Create New Instance
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </Link>
              <Link href="/dashboard/webhooks">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-5 h-5 mr-2" />
                  Setup Webhook
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Upgrade Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Plan Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Plan Status</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {user?.subscription.plan} Plan
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Instances Used</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.instances.length || 0} / {user?.subscription.plan === 'free' ? 1 : user?.subscription.plan === 'basic' ? 3 : user?.subscription.plan === 'pro' ? 10 : 50}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((user?.instances.length || 0) / (user?.subscription.plan === 'free' ? 1 : user?.subscription.plan === 'basic' ? 3 : user?.subscription.plan === 'pro' ? 10 : 50)) * 100}%` 
                  }}
                />
              </div>
              {user?.subscription.plan === 'free' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Upgrade to unlock more features</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Get more instances, messages, and advanced features with our paid plans.
                  </p>
                  <Link href="/dashboard/billing">
                    <Button size="sm">View Plans</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}