# TrustLens

**Know Before You Click.**

TrustLens is a production-ready web application that helps users determine whether websites, emails, SMS messages, WhatsApp messages, job offers, investment opportunities, crypto platforms, QR codes, or screenshots are safe or potentially fraudulent.

## Features

- **URL Scanner** - Check if a website is safe or fraudulent
- **Email Checker** - Analyze emails for phishing attempts
- **SMS/Phone Checker** - Verify SMS messages and phone numbers
- **Screenshot Scanner** - OCR-based screenshot analysis
- **QR Code Scanner** - Extract and analyze QR code content
- **Community Reports** - User-submitted scam reports
- **Scam Alerts** - Real-time cybersecurity threat alerts
- **AI-Powered Analysis** - Machine learning threat detection
- **Blog & Knowledge Center** - Cybersecurity education
- **REST API** - Integrate security analysis into your apps

## Tech Stack

### Frontend
- React 19, TypeScript, Vite
- TailwindCSS, Framer Motion
- TanStack Query, React Router
- React Hook Form, Zod
- Lucide Icons

### Backend
- Node.js, Express.js, TypeScript
- MongoDB with Mongoose
- JWT Authentication with bcrypt
- Helmet, CORS, Rate Limiting
- Pino Logging
- Tesseract OCR
- PDF Generation

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trustlens.git
cd trustlens
```

2. Install backend dependencies:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

3. Install frontend dependencies:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser.

## Project Structure

```
trustlens/
├── shared/              # Shared types, validation, utilities
├── backend/             # Express API server
│   ├── src/
│   │   ├── config/      # Application configuration
│   │   ├── controllers/ # Route handlers
│   │   ├── db/          # Database connection
│   │   ├── middleware/   # Express middleware
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   └── uploads/         # File uploads
├── frontend/            # React SPA
│   └── src/
│       ├── api/         # API client
│       ├── components/  # Reusable components
│       ├── context/     # React context
│       ├── hooks/       # Custom hooks
│       └── pages/       # Page components
└── docker-compose.yml   # Docker setup
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/scan/url | Analyze a URL |
| POST | /api/v1/scan/email | Analyze an email |
| POST | /api/v1/scan/sms | Analyze SMS/phone |
| GET | /api/v1/scan/report/:shareId | Get report |
| GET | /api/v1/scan/report/:shareId/pdf | Download PDF |
| GET | /api/v1/community | Get community reports |
| GET | /api/v1/blog | Get blog posts |
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/register | User registration |

## Deployment

### Docker
```bash
docker-compose up -d
```

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set framework to Vite
3. Set root directory to `frontend`
4. Add environment variables

### Backend (Render)
1. Create a new Web Service on Render
2. Set root directory to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables from `.env.example`

### Database (MongoDB Atlas)
1. Create a free MongoDB Atlas cluster
2. Create a database user
3. Whitelist your deployment IPs
4. Copy the connection string to your `.env`

## Environment Variables

### Backend
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_URL=http://localhost:5173
```

## Security Features

- Helmet middleware for security headers
- Rate limiting on all endpoints
- Input sanitization (MongoDB injection prevention)
- XSS protection
- CORS configuration
- JWT with refresh tokens
- Password hashing with bcrypt
- File upload validation
- Comprehensive logging

## License

MIT
# Trustlens
