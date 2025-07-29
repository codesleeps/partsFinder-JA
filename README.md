# Auto Parts Finder App

A modern web application for finding auto parts based on vehicle information. Built with React frontend, Node.js/Express backend, and SQLite database.

## Features

- **Vehicle Information Lookup**: Search by make, model, and year
- **Part Categories**: Browse parts by category (Engine, Brakes, Suspension, etc.)
- **Search History**: Track and repeat previous searches
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Search**: Fast part lookup with detailed information

## Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **APIs**: Ready for integration with CarGurus, Edmunds, and other automotive APIs

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
```bash
npm run install-all
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

## Project Structure

```
auto-parts-finder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   └── index.js           # Express server
├── database.db            # SQLite database (created automatically)
└── package.json           # Root package.json
```

## API Integration

The app is designed to integrate with automotive APIs:

### Supported APIs (Ready for Integration)
- **CarGurus API**: Vehicle data and specifications
- **Edmunds API**: Vehicle information and pricing
- **Parts APIs**: Various auto parts suppliers

### Current Implementation
- Mock data for development and testing
- Database structure ready for real data
- API endpoints structured for easy integration

## Database Schema

### Users Table
- id, email, name, created_at

### Search History Table
- id, user_id, vehicle_make, vehicle_model, vehicle_year, part_category, search_query, created_at

### Vehicle Cache Table
- id, make, model, year, data, created_at

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production

## Next Steps for Production

1. **API Integration**: Replace mock data with real automotive APIs
2. **User Authentication**: Add user registration and login
3. **Payment Integration**: Add shopping cart and payment processing
4. **Advanced Search**: Implement filters, sorting, and advanced search options
5. **Inventory Management**: Real-time inventory tracking
6. **Supplier Integration**: Connect with multiple parts suppliers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details