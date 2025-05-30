# Prime Skin Clinic - Dermatology Hospital Dashboard

A comprehensive management system for dermatology clinics, featuring appointment scheduling, prescription management, billing, and analytics.

## Features

- 🏥 Patient Management
- 📅 Appointment Scheduling
- 💊 Prescription Management
- 💰 Billing and Invoicing
- 📊 Analytics Dashboard
- 👥 Staff Management
- 🔐 Role-based Access Control

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Environment Variables

Create `.env` files in both client and server directories:

### Client (.env)
```
VITE_API_URL=http://localhost:5001/api
```

### Server (.env)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/prime-skin-clinic
JWT_SECRET=your_jwt_secret_here
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Alimaster30/Prime-Skin-Clinic.git
   cd Prime-Skin-Clinic
   ```

2. Install dependencies for client, server, and root:
   ```bash
   npm run install-all
   ```

## Development

Run both client and server in development mode:
```bash
npm run dev
```

Or run them separately:
- Client only: `npm run client`
- Server only: `npm run server`

## Production Build

1. Build both client and server:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Database Seeding

To populate the database with initial data:
```bash
npm run seed
```

## Project Structure

```
Pak-Skin-Care/
├── client/               # Frontend React application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/               # Backend Node.js application
│   ├── src/
│   ├── dist/
│   └── package.json
└── package.json         # Root package.json for managing both client and server
```

## API Documentation

The API documentation is available at `http://localhost:5001/api-docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
