# Social Rotation - Frontend

React + TypeScript frontend for the Social Rotation content scheduling platform.

## ✅ What's Complete

- ✅ **React + Vite + TypeScript** setup
- ✅ **React Router** for navigation
- ✅ **Zustand** for state management
- ✅ **React Query** for API data fetching
- ✅ **Axios** for HTTP requests
- ✅ **Authentication** - Login & Register pages
- ✅ **Layout** - Sidebar navigation
- ✅ **Protected Routes** - Auth-based routing
- ✅ **API Service** - Complete API client for Rails backend

## 🚀 Getting Started

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will run at **http://localhost:3001**

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx   # Main layout with sidebar
├── pages/           # Page components
│   ├── Login.tsx    # Login page
│   ├── Register.tsx # Register page
│   ├── Dashboard.tsx # Dashboard (placeholder)
│   ├── Buckets.tsx  # Buckets management (placeholder)
│   ├── Schedule.tsx # Scheduling (placeholder)
│   ├── Marketplace.tsx # Marketplace (placeholder)
│   └── Profile.tsx  # User profile (placeholder)
├── services/        # API services
│   └── api.ts       # Axios instance + API endpoints
├── store/           # State management
│   └── authStore.ts # Authentication state (Zustand)
├── types/           # TypeScript types
├── hooks/           # Custom React hooks
├── App.tsx          # Main app component with routing
└── main.tsx         # Entry point
```

## 🔌 API Integration

The frontend connects to the Rails API at `http://localhost:3000/api/v1`

### Available API Endpoints:

**Auth:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

**Buckets:**
- `GET /buckets` - List all buckets
- `POST /buckets` - Create bucket
- `PATCH /buckets/:id` - Update bucket
- `DELETE /buckets/:id` - Delete bucket
- `GET /buckets/:id/images` - Get bucket images

**Schedules:**
- `GET /bucket_schedules` - List all schedules
- `POST /bucket_schedules` - Create schedule
- `DELETE /bucket_schedules/:id` - Delete schedule

**Marketplace:**
- `GET /marketplace` - List purchased items
- `GET /marketplace/available` - List available items
- `POST /marketplace/:id/clone` - Clone marketplace item

**User:**
- `GET /user_info` - Get user profile
- `PATCH /user_info` - Update profile
- `GET /user_info/connected_accounts` - Get connected social accounts

## 🎨 Pages

### ✅ Completed
- **Login** - User authentication with email/password
- **Register** - New user signup
- **Layout** - Sidebar navigation with logout

### 🚧 To Build
- **Dashboard** - Overview with stats and recent activity
- **Buckets** - Create, edit, delete buckets; upload images
- **Schedule** - Create rotation/once/annual schedules
- **Marketplace** - Browse and purchase content packages
- **Profile** - Edit profile, watermark settings, social connections

## 🔐 Authentication

Uses Zustand for state management with localStorage persistence:
- Login saves JWT token and user data
- Token automatically included in all API requests
- 401 responses trigger automatic logout
- Protected routes redirect to login if not authenticated

## 🎯 Next Steps

1. **Build Buckets Page**
   - List user's buckets
   - Create new bucket form
   - Upload images to buckets
   - Edit bucket details
   - Delete buckets

2. **Build Schedule Page**
   - Create rotation schedules
   - Create once/annual schedules
   - Select social networks
   - Time/date pickers
   - Preview next posts

3. **Build Marketplace Page**
   - Browse available packages
   - Image carousel preview
   - Purchase/clone functionality
   - View purchased items

4. **Build Profile Page**
   - Edit user info
   - Upload watermark logo
   - Watermark settings (opacity, scale, position)
   - Connect social media accounts (OAuth)

5. **Add Backend Features**
   - JWT authentication in Rails
   - File upload (Digital Ocean Spaces)
   - Image processing (watermarks)
   - Background jobs (Sidekiq)
   - Social media API integration

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client

## 📝 Notes

- Frontend runs on port **3001**
- Backend runs on port **3000**
- Vite proxy configured for `/api` requests
- All API calls automatically include auth token
- Auth state persists in localStorage
