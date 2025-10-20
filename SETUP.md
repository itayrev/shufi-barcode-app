# Getting Started with Shufi - Barcode Management App

## Quick Start

1. **Install dependencies for all parts:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start both the backend server on http://localhost:5001 and the frontend on http://localhost:3001.

## Manual Setup

If you prefer to set up each part manually:

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Configuration

Make sure to update the backend/.env file with your preferred settings:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3001
```

## Features Overview

✅ **User Authentication**
- Username/password registration and login
- JWT token-based authentication
- Secure password hashing

✅ **Barcode Management**
- Upload barcode images (JPEG, PNG, GIF, WebP)
- View barcodes in grid or list layout
- Fullscreen viewing with zoom controls
- Toggle used/unused status
- Set and edit barcode amounts
- Delete barcodes with confirmation

✅ **Real-time Synchronization**
- All actions sync instantly across all users
- Socket.IO powered real-time updates
- Live status updates for barcode changes

✅ **Modern UI/UX**
- Responsive design for all screen sizes
- Tailwind CSS for modern styling
- Smooth animations and transitions
- Toast notifications for user feedback
- Drag & drop file upload
- Keyboard shortcuts (ESC to close modals)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Barcodes
- `GET /api/barcodes` - Get all barcodes
- `POST /api/barcodes` - Upload new barcode image
- `PUT /api/barcodes/:id` - Update barcode (status/amount)
- `DELETE /api/barcodes/:id` - Delete barcode

## File Structure

```
shufi/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── app.js         # Main server file
│   ├── uploads/           # Uploaded barcode images
│   └── package.json
├── frontend/              # React.js frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── services/     # API service layer
│   │   └── utils/        # Utility functions
│   └── package.json
└── package.json          # Root package with scripts
```

## Production Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Environment Variables for Production:**
   - Update JWT_SECRET to a secure random string
   - Set NODE_ENV to 'production'
   - Configure FRONTEND_URL to your domain
   - Set up proper database path

## Troubleshooting

**If you get CORS errors:**
- Make sure FRONTEND_URL in backend/.env matches your frontend URL
- Check that both servers are running on the correct ports

**If images don't load:**
- Verify the uploads directory exists in backend/
- Check file permissions
- Ensure the backend server is accessible from frontend

**If real-time updates don't work:**
- Check browser console for Socket.IO connection errors
- Verify both frontend and backend are using the same Socket.IO versions
- Check if firewall is blocking WebSocket connections