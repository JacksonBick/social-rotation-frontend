# 🚀 Social Rotation Frontend - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Rails backend running on http://localhost:3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on **http://localhost:3001**

---

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout with sidebar
│   └── ImageEditor.tsx # Image editing modal
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Dashboard with stats
│   ├── Buckets.tsx     # Bucket management
│   ├── BucketImages.tsx # Image upload/management
│   ├── Schedule.tsx    # Scheduling interface
│   └── Profile.tsx     # User profile & OAuth
├── services/           # API services
│   └── api.ts         # Axios instance with interceptors
├── store/             # State management
│   └── authStore.ts   # Zustand auth store
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point
```

---

## 🔑 Environment Variables

The frontend connects to the backend at `http://localhost:3000` by default.

To change this, update `src/services/api.ts`:
```typescript
const api = axios.create({
  baseURL: 'YOUR_BACKEND_URL/api/v1',
  // ...
});
```

---

## 🎨 Features

### Authentication
- JWT-based authentication
- Protected routes
- Auto-redirect to login if not authenticated
- Token stored in Zustand + localStorage

### Bucket Management
- Create/delete buckets
- View bucket details
- Upload images
- Edit images (crop, rotate, filters)
- Delete images

### Scheduling
- Create rotation schedules (daily)
- Create once schedules (one-time)
- Create annually schedules (yearly)
- Select social media platforms
- Add descriptions

### Profile
- Edit account information
- Connect social media accounts (OAuth)
- View connection status
- Disconnect accounts

---

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client
- **react-easy-crop** - Image cropping

---

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔗 API Endpoints

All API calls go through `src/services/api.ts` which:
- Adds JWT token to headers
- Handles 401 errors (logout)
- Sets base URL to backend

---

## 🎯 Next Steps

1. Set up OAuth credentials (see backend OAUTH_SETUP_GUIDE.md)
2. Test OAuth flows
3. Implement remaining features:
   - Digital Ocean Spaces integration
   - Watermark processing
   - Social media posting
   - Background jobs

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure Rails backend has CORS configured for `http://localhost:3001`
- Check `config/initializers/cors.rb` in backend

### OAuth Not Working
- Ensure backend has `.env` file with OAuth credentials
- Check callback URLs match exactly
- Verify Rails server is running

### Images Not Loading
- Check that backend is serving files from `public/uploads`
- Verify image paths in database

---

## 📚 Documentation

- `PROGRESS_SUMMARY.md` - Complete feature list and status
- Backend `OAUTH_SETUP_GUIDE.md` - How to set up OAuth apps
- Backend `API_DOCUMENTATION.md` - Full API reference

