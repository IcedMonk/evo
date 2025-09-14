# Evolution API SAAS Platform

A comprehensive, production-ready Software as a Service (SAAS) platform for managing Evolution API instances with a modern, animated UI and full API functionality.

## 🚀 Features

### Core Functionality
- **Instance Management**: Create, manage, and monitor multiple WhatsApp instances
- **Message Management**: Send text messages, media files, and template messages
- **Webhook Management**: Configure and manage webhooks for real-time events
- **User Authentication**: Secure user registration, login, and profile management
- **Subscription Management**: Multiple pricing tiers with usage tracking
- **Real-time Updates**: Socket.IO integration for live updates

### UI/UX Features
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Smooth Animations**: Framer Motion animations throughout the application
- **Interactive Components**: Custom UI components with hover effects and transitions
- **Mobile Responsive**: Optimized for all device sizes
- **Dark/Light Mode Ready**: Prepared for theme switching

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **API Integration**: Complete Evolution API integration
- **Real-time Communication**: Socket.IO for live updates
- **Form Validation**: Zod schema validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: JWT authentication, rate limiting, and input validation

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Axios**: HTTP client
- **Lucide React**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **MongoDB**: Database with Mongoose ODM
- **Socket.IO**: Real-time communication
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Express Rate Limit**: Rate limiting
- **Helmet**: Security headers

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- Evolution API server running (https://evo.wcpilot.me/)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evolution-api-saas
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   # Edit frontend/.env.local with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## 🔧 Configuration

### Backend Configuration (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/evolution-api-saas

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Evolution API
EVOLUTION_API_URL=https://evo.wcpilot.me
EVOLUTION_API_KEY=your-evolution-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Evolution API SAAS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Usage

### 1. User Registration & Authentication
- Register a new account at `/auth/register`
- Sign in at `/auth/login`
- Access the dashboard at `/dashboard`

### 2. Instance Management
- Create new WhatsApp instances
- Connect instances using QR codes
- Monitor instance status
- Update instance settings

### 3. Message Management
- Send text messages to phone numbers
- Send media files (images, videos, documents)
- Send template messages
- View message history

### 4. Webhook Management
- Configure webhook endpoints
- Select events to monitor
- Test webhook connections

### 5. Billing & Subscriptions
- View current plan and usage
- Upgrade/downgrade plans
- Manage payment methods
- View billing history

## 🏗 Project Structure

```
evolution-api-saas/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   └── package.json
└── package.json            # Root package.json with scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `PUT /api/auth/reset-password` - Password reset

### Instances
- `POST /api/instances` - Create new instance
- `GET /api/instances` - Get all instances
- `GET /api/instances/:name` - Get specific instance
- `GET /api/instances/:name/qr` - Get QR code
- `PUT /api/instances/:name` - Update instance
- `DELETE /api/instances/:name` - Delete instance

### Messages
- `POST /api/messages/send-text` - Send text message
- `POST /api/messages/send-media` - Send media message
- `POST /api/messages/send-template` - Send template message
- `GET /api/messages/:instance/chats` - Get chats
- `GET /api/messages/:instance/chat/:jid` - Get messages

### Webhooks
- `POST /api/webhooks/:instance` - Set webhook
- `GET /api/webhooks/:instance` - Get webhook
- `DELETE /api/webhooks/:instance` - Delete webhook

### Billing
- `GET /api/billing/plans` - Get available plans
- `GET /api/billing/subscription` - Get current subscription
- `PUT /api/billing/subscription` - Update subscription
- `POST /api/billing/create-checkout-session` - Create checkout session

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a production MongoDB instance
- Configure proper JWT secrets
- Set up SSL certificates
- Configure production Evolution API URL

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive input validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet Security**: Security headers
- **Environment Variables**: Sensitive data protection

## 📊 Subscription Plans

### Free Plan
- 1 WhatsApp instance
- 100 messages/month
- Basic support
- Standard templates

### Basic Plan ($29/month)
- 3 WhatsApp instances
- 1,000 messages/month
- Priority support
- Custom templates
- Webhooks

### Pro Plan ($99/month)
- 10 WhatsApp instances
- 10,000 messages/month
- 24/7 support
- Advanced templates
- Advanced analytics

### Enterprise Plan ($299/month)
- 50 WhatsApp instances
- 100,000 messages/month
- Dedicated support
- Custom integrations
- Custom branding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Create an issue on GitHub
- Contact the development team

## 🔮 Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Template message builder
- [ ] Bulk message sending
- [ ] Contact management
- [ ] Group management
- [ ] Multi-language support
- [ ] Mobile app
- [ ] API rate limiting per user
- [ ] Advanced webhook filtering
- [ ] Message scheduling
- [ ] Automated responses
- [ ] Integration marketplace

---

Built with ❤️ using modern web technologies for professional WhatsApp API management.