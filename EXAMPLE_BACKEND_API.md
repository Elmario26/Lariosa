# EXAMPLE BACKEND API (Node.js + Express)

This is a reference implementation to help you understand what your backend should look like.

## Setup
```bash
npm install express cors bcryptjs jsonwebtoken dotenv
```

## Example Server Code

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock database (replace with real database)
const users = [];

// Secret keys
const ACCESS_TOKEN_SECRET = 'your-secret-key-here';
const REFRESH_TOKEN_SECRET = 'your-refresh-secret-here';

// ============= HELPER FUNCTIONS =============

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

// ============= ROUTES =============

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: {
          email: email ? [] : ['Email is required'],
          password: password ? [] : ['Password is required'],
          fullName: fullName ? [] : ['Full name is required'],
        },
      });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { email: ['Email already exists'] },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.push(newUser);

    // Generate tokens
    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.fullName,
        email: newUser.email,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 3. GET CURRENT USER
app.get('/api/me', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. LOGOUT
app.post('/api/logout', verifyToken, (req, res) => {
  try {
    // In a real app, you'd invalidate the token (blacklist it)
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. REFRESH TOKEN
app.post('/api/refresh-token', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============= START SERVER =============

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API base URL: http://localhost:${PORT}/api`);
});
```

## .env File
```
NODE_ENV=development
PORT=3000
ACCESS_TOKEN_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
```

## package.json
```json
{
  "name": "lariosa-api",
  "version": "1.0.0",
  "description": "LARIOSA Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## How to Run

```bash
# Install dependencies
npm install

# Create .env file with secrets
echo "ACCESS_TOKEN_SECRET=your-secret-key" > .env
echo "REFRESH_TOKEN_SECRET=your-refresh-secret" >> .env

# Start server
npm start

# Server will run on http://localhost:3000
```

## Test in Postman

### 1. Register
```
POST http://localhost:3000/api/register
Body: {
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
```
POST http://localhost:3000/api/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Get User (with token)
```
GET http://localhost:3000/api/me
Headers: Authorization: Bearer <token>
```

### 4. Refresh Token
```
POST http://localhost:3000/api/refresh-token
Body: {
  "refreshToken": "<refresh_token>"
}
```

## Important Notes

This is a **basic reference implementation** for development only:

1. **Use a real database** - Don't store users in memory
2. **Don't hardcode secrets** - Use environment variables
3. **Implement input validation** - This example is minimal
4. **Add rate limiting** - Prevent brute force attacks
5. **Use HTTPS in production** - Never HTTP
6. **Implement proper error handling** - Better error responses
7. **Add request logging** - For debugging
8. **Use JWT blacklist** - For proper logout
9. **Implement email verification** - For registration
10. **Add password reset flow** - For forgotten passwords

For production use recommended frameworks:
- MongoDB + Express (JavaScript)
- Django + DRF (Python)
- Laravel (PHP)
- Spring Boot (Java)
- ASP.NET Core (.NET)
