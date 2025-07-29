# 🔧 Phase 1 Implementation Guide
*MVP Enhancement - Weeks 1-3*

## 📋 **Week 1: API Integration**

### **Day 1-2: Vehicle Data API Setup**

#### **Edmunds API Integration**
```javascript
// server/services/edmundsAPI.js
class EdmundsService {
  constructor() {
    this.apiKey = process.env.EDMUNDS_API_KEY;
    this.baseURL = 'https://api.edmunds.com/api/vehicle/v2';
  }

  async getMakes(year) {
    const response = await axios.get(
      `${this.baseURL}/makes?year=${year}&api_key=${this.apiKey}`
    );
    return response.data.makes;
  }

  async getModels(make, year) {
    const response = await axios.get(
      `${this.baseURL}/${make}/models?year=${year}&api_key=${this.apiKey}`
    );
    return response.data.models;
  }

  async getVehicleDetails(make, model, year) {
    const response = await axios.get(
      `${this.baseURL}/${make}/${model}/${year}?api_key=${this.apiKey}`
    );
    return response.data;
  }
}
```

#### **VIN Decoder Integration**
```javascript
// server/services/vinDecoder.js
class VINDecoderService {
  async decodeVIN(vin) {
    // Using NHTSA free API
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    
    return {
      make: this.extractValue(response.data, 'Make'),
      model: this.extractValue(response.data, 'Model'),
      year: this.extractValue(response.data, 'Model Year'),
      engine: this.extractValue(response.data, 'Engine Configuration'),
      transmission: this.extractValue(response.data, 'Transmission Style')
    };
  }
}
```

### **Day 3-4: Parts Supplier Integration**

#### **RockAuto API Integration**
```javascript
// server/services/rockAutoAPI.js
class RockAutoService {
  async searchParts(vehicleInfo, category) {
    const searchParams = {
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      year: vehicleInfo.year,
      category: category
    };

    const response = await axios.post(
      'https://api.rockauto.com/parts/search',
      searchParams,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ROCKAUTO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.parts.map(part => ({
      id: part.partId,
      name: part.description,
      partNumber: part.partNumber,
      price: part.price,
      brand: part.brand,
      availability: part.inStock ? 'In Stock' : 'Out of Stock',
      supplier: 'RockAuto',
      supplierPartId: part.id
    }));
  }
}
```

### **Day 5-7: Caching & Error Handling**

#### **Redis Caching Setup**
```javascript
// server/services/cacheService.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

class CacheService {
  async get(key) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, data, ttl = 3600) {
    try {
      await client.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  generateVehicleKey(make, model, year) {
    return `vehicle:${make}:${model}:${year}`;
  }

  generatePartsKey(vehicleInfo, category) {
    return `parts:${vehicleInfo.make}:${vehicleInfo.model}:${vehicleInfo.year}:${category}`;
  }
}
```

---

## 📋 **Week 2: User Authentication**

### **Day 1-3: JWT Authentication System**

#### **User Model & Database**
```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token_hash VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Authentication Service**
```javascript
// server/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name`,
      [email, passwordHash, firstName, lastName]
    );

    const user = result.rows[0];
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email, password) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
```

### **Day 4-5: Frontend Authentication**

#### **Auth Context**
```javascript
// client/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token and get user data
      authService.verifyToken(token)
        .then(userData => setUser(userData))
        .catch(() => localStorage.removeItem('authToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { user, token } = await authService.login(email, password);
    localStorage.setItem('authToken', token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const { user, token } = await authService.register(userData);
    localStorage.setItem('authToken', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **Day 6-7: User Profile & Address Management**

#### **Address Management**
```sql
-- migrations/002_create_addresses.sql
CREATE TABLE user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('billing', 'shipping')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(100),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) DEFAULT 'US',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📋 **Week 3: Testing & Quality Assurance**

### **Day 1-3: Frontend Testing**

#### **Component Testing Setup**
```javascript
// client/src/setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### **HomePage Component Tests**
```javascript
// client/src/components/__tests__/HomePage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import HomePage from '../HomePage';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  test('renders vehicle search form', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
  });

  test('enables model dropdown after selecting make', async () => {
    renderWithProviders(<HomePage />);
    
    const makeSelect = screen.getByLabelText(/make/i);
    fireEvent.change(makeSelect, { target: { value: 'Toyota' } });

    await waitFor(() => {
      const modelSelect = screen.getByLabelText(/model/i);
      expect(modelSelect).not.toBeDisabled();
    });
  });

  test('submits search with valid data', async () => {
    renderWithProviders(<HomePage />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Camry' } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Brake System' } });

    // Submit
    fireEvent.click(screen.getByText(/search parts/i));

    // Verify navigation (mock would be needed)
    await waitFor(() => {
      // Assert search was triggered
    });
  });
});
```

### **Day 4-5: Backend Testing**

#### **API Endpoint Tests**
```javascript
// server/__tests__/auth.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  describe('POST /api/auth/register', () => {
    test('creates new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    test('returns error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('logs in user with valid credentials', async () => {
      // First register a user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

### **Day 6-7: Integration & E2E Testing**

#### **Cypress E2E Tests**
```javascript
// cypress/e2e/user-journey.cy.js
describe('User Journey', () => {
  it('completes full search and registration flow', () => {
    cy.visit('/');

    // Search for parts
    cy.get('[data-testid="make-select"]').select('Toyota');
    cy.get('[data-testid="model-select"]').select('Camry');
    cy.get('[data-testid="year-select"]').select('2020');
    cy.get('[data-testid="category-select"]').select('Brake System');
    cy.get('[data-testid="search-button"]').click();

    // Verify search results
    cy.url().should('include', '/search');
    cy.get('[data-testid="part-card"]').should('have.length.greaterThan', 0);

    // Add item to cart
    cy.get('[data-testid="add-to-cart-button"]').first().click();
    cy.get('[data-testid="cart-badge"]').should('contain', '1');

    // Open cart
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="cart-drawer"]').should('be.visible');

    // Proceed to checkout (would require registration)
    cy.get('[data-testid="checkout-button"]').click();
    
    // Should redirect to login/register
    cy.url().should('include', '/auth');
  });
});
```

---

## 📊 **Success Criteria for Phase 1**

### **Technical Metrics**
- [ ] API response time < 500ms (95th percentile)
- [ ] Frontend test coverage > 70%
- [ ] Backend test coverage > 80%
- [ ] Zero critical security vulnerabilities
- [ ] Mobile responsive design (all screen sizes)

### **Functional Requirements**
- [ ] Real vehicle data from Edmunds API
- [ ] VIN decoding functionality
- [ ] User registration and authentication
- [ ] Parts search with real supplier data
- [ ] Shopping cart functionality
- [ ] Order history tracking

### **Quality Gates**
- [ ] All tests passing in CI/CD pipeline
- [ ] Code review approval for all changes
- [ ] Performance benchmarks met
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

---

## 🚀 **Deployment Checklist**

### **Environment Setup**
- [ ] Production database (PostgreSQL)
- [ ] Redis cache instance
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured

### **Monitoring & Logging**
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Log aggregation (CloudWatch)
- [ ] Uptime monitoring (Pingdom)
- [ ] API usage tracking

### **Security**
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure headers configured

---

## 💡 **Next Steps After Phase 1**

1. **User Feedback Collection**
   - Deploy to staging environment
   - Invite beta users for testing
   - Collect feedback via surveys and analytics

2. **Performance Optimization**
   - Database query optimization
   - API response caching
   - Image optimization
   - Bundle size reduction

3. **Phase 2 Planning**
   - Payment integration research
   - Additional supplier partnerships
   - Mobile app development planning
   - Marketing strategy development

Would you like me to create detailed code templates for any specific component, or help you set up the development environment to start Phase 1?