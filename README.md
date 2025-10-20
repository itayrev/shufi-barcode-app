# Shufi - Barcode Management App

A web application for managing barcodes with real-time synchronization across all users.

## Features

- 🔐 User authentication (username/password)
- 📸 Barcode image upload
- 🔍 Fullscreen barcode viewing
- ✅ Toggle barcode used/unused status
- 💰 Set barcode amounts
- 🗑️ Delete barcodes
- 🔄 Real-time synchronization across all users
- 📱 Responsive design

## Tech Stack

- **Frontend**: React.js with modern UI
- **Backend**: Node.js with Express.js
- **Database**: SQLite (for simplicity)
- **Real-time**: Socket.IO
- **Authentication**: JWT tokens
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

### Development

Run both backend and frontend in development mode:
```bash
npm run dev
```

Or run separately:
- Backend: `npm run dev:backend`
- Frontend: `npm run dev:frontend`

### Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Barcodes
- `GET /api/barcodes` - Get all barcodes
- `POST /api/barcodes` - Upload new barcode
- `PUT /api/barcodes/:id` - Update barcode
- `DELETE /api/barcodes/:id` - Delete barcode

## Real-time Events

- `barcode:created` - New barcode uploaded
- `barcode:updated` - Barcode status/amount changed
- `barcode:deleted` - Barcode removed

## Project Structure

```
shufi/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
└── package.json
```