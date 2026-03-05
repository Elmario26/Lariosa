# API INTEGRATION SETUP

## **Overview**

This project uses **Redux** with **Redux-Saga** for state management and **AsyncStorage** for persisting authentication tokens. The API integration uses the Fetch API with a centralized client configuration.

---

## **Project Structure**

```
src/
├── app/
│   ├── api/
│   │   ├── client.js        # API client configuration & generic request handler
│   │   └── auth.js          # Authentication API calls
│   ├── reducers/
│   │   └── authReducer.js   # Redux reducer for auth state
│   ├── sagas/
│   │   └── authSaga.js      # Redux-Saga for async operations
│   └── store.js             # Redux store configuration
├── screen/
│   └── auth/
│       ├── Login.js         # Login screen with Redux
│       └── Register.js      # Registration screen with Redux
└── ...
```

---

## **Installation**

All required packages have been installed:

```bash
npm install redux redux-saga redux-persist react-redux @react-native-async-storage/async-storage
```

### Android Configuration

The `android/build.gradle` has been updated to include AsyncStorage repository:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri(project(":react-native-async-storage_async-storage").file("local_repo"))
        }
    }
}
```

---

## **API CLIENT CONFIGURATION**

### File: `src/app/api/client.js`

**Environment Setup:**
```javascript
// Available environments
const API_ENDPOINTS = {
  LOCAL: 'http://localhost:3000/api',
  STAGING: 'https://staging-api.example.com/api',
  PRODUCTION: 'https://api.example.com/api'
}

// Change this to switch environments
const ENVIRONMENT = 'LOCAL'
```

**Generic API Request Function:**
```javascript
apiRequest(endpoint, options = {})
```

**Usage Example:**
```javascript
const response = await apiRequest('/login', {
  method: 'POST',
  body: { email, password },
  token: authToken  // Optional authorization header
})
```

---

## **REDUX STATE STRUCTURE**

### Auth State

```javascript
{
  auth: {
    user: {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    isLoading: false,
    error: null,
    isAuthenticated: true
  }
}
```

---

## **REDUX ACTIONS**

### Available Actions

```javascript
// Login
dispatch({ type: 'LOGIN', payload: { email, password } })

// Register
dispatch({ type: 'REGISTER', payload: { fullName, email, password } })

// Logout
dispatch({ type: 'LOGOUT' })

// Get User Profile
dispatch({ type: 'GET_USER' })

// Set Auth State
dispatch({ type: 'SET_AUTH_STATE', payload: { user, token } })

// Clear Error
dispatch({ type: 'CLEAR_ERROR' })
```

---

## **USING REDUX IN COMPONENTS**

### Example: Login Component

```javascript
import { useDispatch, useSelector } from 'react-redux'

const Login = () => {
  const dispatch = useDispatch()
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth)

  const handleLogin = () => {
    dispatch({
      type: 'LOGIN',
      payload: { email, password }
    })
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main')
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error)
    }
  }, [error])

  return (
    // JSX
  )
}
```

---

## **API ENDPOINTS**

### Authentication API (`src/app/api/auth.js`)

#### 1. **Login**
```javascript
loginAPI(email, password)
// POST /login
// Response: { user, token, refreshToken }
```

#### 2. **Register**
```javascript
registerAPI({ fullName, email, password })
// POST /register
// Response: { user, token, refreshToken }
```

#### 3. **Get Current User**
```javascript
getCurrentUser(token)
// GET /me
// Headers: Authorization: Bearer {token}
// Response: { user }
```

#### 4. **Logout**
```javascript
logoutAPI(token)
// POST /logout
// Headers: Authorization: Bearer {token}
// Response: { message }
```

#### 5. **Refresh Token**
```javascript
refreshTokenAPI(refreshToken)
// POST /refresh-token
// Body: { refreshToken }
// Response: { token, refreshToken }
```

---

## **ASYNC STORAGE**

Tokens are automatically saved to AsyncStorage on login/register:

```javascript
// Keys used
'authToken'      // Access token
'refreshToken'   // Refresh token
```

To retrieve manually:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage'

const token = await AsyncStorage.getItem('authToken')
const refreshToken = await AsyncStorage.getItem('refreshToken')
```

---

## **REDUX-SAGA**

### How It Works

Sagas intercept Redux actions and handle side effects (API calls, storage operations):

```
Component
   ↓
dispatch(action)
   ↓
Saga intercepts
   ↓
Makes API call
   ↓
Saves to AsyncStorage
   ↓
Dispatches success/failure action
   ↓
Reducer updates state
   ↓
Component re-renders
```

### Available Sagas

- `loginSaga` - Handles login workflow
- `registerSaga` - Handles registration workflow
- `logoutSaga` - Handles logout and token cleanup
- `getUserSaga` - Fetches current user profile

---

## **TESTING THE SETUP**

### 1. Test Login

Use Postman with your API server running:

```
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Expected Response:
```json
{
  "user": { "id": "123", "name": "User", "email": "test@example.com" },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 2. Test Protected Endpoint

```
GET http://localhost:3000/api/me
Authorization: Bearer eyJhbGc...
```

### 3. Test in App

The Login and Register components now have full Redux integration. Test by:
1. Opening the Register screen
2. Filling form and clicking Sign Up
3. Check console for Redux actions and API calls
4. Monitor AsyncStorage for token persistence

---

## **ENVIRONMENT CONFIGURATION**

To switch environments, edit `src/app/api/client.js`:

```javascript
// Change ENVIRONMENT variable
const ENVIRONMENT = 'STAGING'  // or 'PRODUCTION'
```

Or set it dynamically based on build configuration:

```javascript
const ENVIRONMENT = __DEV__ ? 'LOCAL' : 'PRODUCTION'
```

---

## **ERROR HANDLING**

Errors are stored in Redux state and automatically displayed:

```javascript
const { error } = useSelector(state => state.auth)

useEffect(() => {
  if (error) {
    Alert.alert('Error', error)
    // Optionally clear error
    dispatch({ type: 'CLEAR_ERROR' })
  }
}, [error])
```

---

## **NEXT STEPS**

1. **Implement Backend API** - Create endpoints matching the specs in `POSTMAN_SETUP_GUIDE.md`
2. **Test with Postman** - Follow the Postman guide to test all endpoints
3. **Update API Base URL** - Change `BASE_URL` in `src/app/api/client.js` to your server
4. **Add More Endpoints** - Create additional API functions as needed
5. **Extend Reducers/Sagas** - Add more Redux entities (products, posts, etc.) following the same pattern
6. **Add Error Boundaries** - Wrap components with error boundaries for production
7. **Implement Refresh Token Logic** - Add automatic token refresh before expiration

---

## **TROUBLESHOOTING**

### Issue: "Cannot find module 'redux'"
**Solution**: Run `npm install` again or delete `node_modules` and `package-lock.json`, then reinstall.

### Issue: Token not persisting
**Solution**: Check AsyncStorage permissions and ensure Redux-Persist is properly configured in `store.js`.

### Issue: API calls not working
**Solution**: 
- Verify `BASE_URL` in `client.js`
- Check if backend is running
- Ensure headers are correctly set
- Check network connectivity

### Issue: AsyncStorage throws error on Android
**Solution**: Ensure `android/build.gradle` has the correct maven repository for AsyncStorage.

---

## **USEFUL COMMANDS**

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# View Redux state (if using Redux DevTools)
npm install --save-dev redux-devtools redux-devtools-extension
```

---

## **REFERENCES**

- [Redux Documentation](https://redux.js.org/)
- [Redux-Saga Documentation](https://redux-saga.js.org/)
- [React-Redux Documentation](https://react-redux.js.org/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Last Updated**: March 5, 2026
**Status**: ✅ Complete Setup Ready
