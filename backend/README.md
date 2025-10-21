# Traffic Slight Backend API

A comprehensive backend API for the Traffic Slight motorcycle tracking application, providing real-time tracking, analytics, and management features.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Motorcycle Management** - CRUD operations for motorcycle profiles and tracking
- **Trip Tracking** - Real-time trip monitoring with GPS tracking
- **Analytics Dashboard** - Comprehensive analytics and reporting
- **Fuel Management** - Fuel logging and consumption tracking
- **Maintenance Records** - Service and maintenance tracking
- **Notifications** - Real-time notifications system
- **Saved Destinations** - Favorite locations management
- **Gas Station Integration** - Gas station finder and price tracking
- **Leaderboards** - User rankings and achievements

## 📁 Project Structure

```
backend/
├── controllers/           # Business logic controllers
│   ├── authController.js
│   ├── motorcycleController.js
│   ├── analyticsController.js
│   ├── fuelLogController.js
│   ├── notificationController.js
│   └── ...
├── models/               # Database models
│   ├── User.js
│   ├── Motor.js
│   ├── Trip.js
│   ├── FuelLogModel.js
│   └── ...
├── routes/               # API routes
│   ├── auth.js
│   ├── motorcycleRoutes.js
│   ├── analyticsRoutes.js
│   └── ...
├── middleware/           # Custom middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── rateLimitMiddleware.js
├── server.js            # Main server file
└── package.json         # Dependencies and scripts
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/traffic_slight
   JWT_SECRET=your_jwt_secret_key
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_USER=your_email@example.com
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "city": "New York",
  "province": "NY",
  "barangay": "Manhattan",
  "street": "123 Main St"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Motorcycle Management

#### Get All Motorcycles
```http
GET /api/motors
Authorization: Bearer <token>
```

#### Create Motorcycle
```http
POST /api/motors
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "My Bike",
  "brand": "Honda",
  "model": "CBR600RR",
  "year": 2020,
  "engineDisplacement": 600,
  "fuelCapacity": 18.5,
  "currentFuelLevel": 15.0
}
```

### Trip Tracking

#### Start Trip
```http
POST /api/trips
Authorization: Bearer <token>
Content-Type: application/json

{
  "motorId": "motor_id_here",
  "destination": "Downtown",
  "startLocation": {
    "address": "123 Main St",
    "lat": 40.7128,
    "lng": -74.0060
  },
  "endLocation": {
    "address": "456 Broadway",
    "lat": 40.7589,
    "lng": -73.9851
  }
}
```

#### Get Trip Analytics
```http
GET /api/analytics/trips?period=30d&motorId=motor_id
Authorization: Bearer <token>
```

### Fuel Management

#### Log Fuel Entry
```http
POST /api/fuel-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "motorId": "motor_id_here",
  "liters": 15.5,
  "pricePerLiter": 1.25,
  "notes": "Full tank at Shell"
}
```

#### Get Fuel Statistics
```http
GET /api/fuel-stats/motor_id
Authorization: Bearer <token>
```

### Analytics & Reporting

#### Dashboard Analytics
```http
GET /api/analytics/dashboard?period=30d
Authorization: Bearer <token>
```

#### Performance Analytics
```http
GET /api/analytics/performance?period=7d&motorId=motor_id
Authorization: Bearer <token>
```

#### Maintenance Analytics
```http
GET /api/analytics/maintenance?period=30d
Authorization: Bearer <token>
```

## 🔧 Controllers Documentation

### AuthController
Handles user authentication and authorization.

**Methods:**
- `register(req, res)` - Register new user
- `login(req, res)` - User login
- `resetPassword(req, res)` - Password reset request
- `verifyReset(req, res)` - Verify reset token
- `changePassword(req, res)` - Change user password
- `logout(req, res)` - User logout
- `verifyToken(req, res)` - Verify JWT token

### MotorcycleController
Manages motorcycle profiles and tracking.

**Methods:**
- `getAllMotorcycles(req, res)` - Get all user motorcycles
- `getMotorcycle(req, res)` - Get single motorcycle
- `createMotorcycle(req, res)` - Create new motorcycle
- `updateMotorcycle(req, res)` - Update motorcycle details
- `deleteMotorcycle(req, res)` - Soft delete motorcycle
- `restoreMotorcycle(req, res)` - Restore deleted motorcycle
- `updateFuelLevel(req, res)` - Update fuel level
- `getMotorcycleAnalytics(req, res)` - Get motorcycle analytics

### AnalyticsController
Provides comprehensive analytics and reporting.

**Methods:**
- `getDashboard(req, res)` - Get dashboard analytics
- `generateDailyAnalytics(req, res)` - Generate daily analytics
- `getTripAnalytics(req, res)` - Get trip analytics
- `getFuelAnalytics(req, res)` - Get fuel analytics
- `getMaintenanceAnalytics(req, res)` - Get maintenance analytics
- `getPerformanceAnalytics(req, res)` - Get performance analytics
- `getReportAnalytics(req, res)` - Get report analytics
- `exportAnalytics(req, res)` - Export analytics data

### FuelLogController
Manages fuel logging and consumption tracking.

**Methods:**
- `getFuelLogsByUser(req, res)` - Get user fuel logs
- `createFuelLog(req, res)` - Create fuel log entry
- `updateFuelLog(req, res)` - Update fuel log
- `deleteFuelLog(req, res)` - Delete fuel log
- `getFuelLogCount(req, res)` - Get fuel log count
- `getFuelLogOverview(req, res)` - Get fuel overview (admin)
- `getAvgFuelByMotor(req, res)` - Get average fuel by motor
- `getTopFuelSpenders(req, res)` - Get top fuel spenders
- `getMonthlyFuelUsage(req, res)` - Get monthly fuel usage

## 🗄️ Database Models

### User Model
```javascript
{
  email: String (required, unique),
  password: String (required),
  firstName: String (required),
  lastName: String (required),
  name: String (required),
  phone: String,
  city: String (required),
  province: String (required),
  barangay: String (required),
  street: String (required),
  location: {
    lat: Number,
    lng: Number
  },
  preferences: {
    units: String (enum: ['metric', 'imperial']),
    language: String,
    notifications: Boolean,
    theme: String (enum: ['light', 'dark', 'auto'])
  },
  role: String (enum: ['user', 'admin']),
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date
}
```

### Motor Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  nickname: String,
  brand: String,
  model: String,
  year: Number,
  engineDisplacement: Number,
  fuelCapacity: Number,
  currentFuelLevel: Number,
  fuelConsumption: Number,
  analytics: {
    totalDistance: Number,
    totalTrips: Number,
    lastUpdated: Date
  },
  isDeleted: Boolean
}
```

### Trip Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  motorId: ObjectId (ref: 'Motor'),
  destination: String,
  distance: Number,
  fuelUsedMin: Number,
  fuelUsedMax: Number,
  tripStartTime: Date,
  tripEndTime: Date,
  actualDistance: Number,
  actualFuelUsedMin: Number,
  actualFuelUsedMax: Number,
  duration: Number,
  kmph: Number,
  startLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  endLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  status: String (enum: ['planned', 'in_progress', 'completed', 'cancelled'])
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Request validation and sanitization
- **CORS Protection** - Cross-origin resource sharing
- **Helmet Security** - Security headers
- **MongoDB Sanitization** - NoSQL injection protection

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/traffic_slight
JWT_SECRET=your_strong_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_USER=your_email@example.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Production Checklist
- [ ] Set secure JWT secret
- [ ] Configure MongoDB connection
- [ ] Set up email service (SendGrid)
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up SSL/TLS certificates

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🔄 Migration Guide

### From Root Level Backend
1. Update import paths in controllers
2. Update model references
3. Update route configurations
4. Test all endpoints

### Database Migration
1. Backup existing data
2. Update model schemas
3. Run migration scripts
4. Verify data integrity

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.