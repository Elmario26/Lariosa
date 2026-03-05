# QUICK START GUIDE - API INTEGRATION

## 📋 What Was Done

Your React Native app now has:
- ✅ **Redux** state management
- ✅ **Redux-Saga** for async operations
- ✅ **AsyncStorage** for token persistence
- ✅ **Fetch API** client with centralized configuration
- ✅ **Login & Register screens** with Redux integration
- ✅ **Complete documentation** for API setup

---

## 🎯 5-MINUTE SETUP

### 1️⃣ Start Your Backend Server

Create a Node.js server (follow `EXAMPLE_BACKEND_API.md`):

```bash
# Create new folder
mkdir lariosa-api
cd lariosa-api

# Initialize and install packages
npm init -y
npm install express cors bcryptjs jsonwebtoken dotenv

# Create server.js from EXAMPLE_BACKEND_API.md
# Run the server
npm start
# Server running on http://localhost:3000 ✅
```

### 2️⃣ Verify API Works in Postman

1. Open Postman
2. Create Request:
   ```
   POST http://localhost:3000/api/register
   Content-Type: application/json
   
   {
     "fullName": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
3. Should get response with `token` ✅

### 3️⃣ Start Your React Native App

```bash
# In your LARIOSA project folder
npm start

# In another terminal
npm run android
# or
npm run ios
```

### 4️⃣ Test Register Screen

1. Open app on device/emulator
2. Go to Register screen
3. Fill form:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm: password123
4. Tap "Sign Up"
5. Should see success ✅

### 5️⃣ Test Login Screen

1. Go to Login screen
2. Enter credentials:
   - Email: john@example.com
   - Password: password123
3. Tap "Login"
4. Should navigate to home ✅

---

## 📁 Key Files

| File | Purpose | Edit If |
|------|---------|---------|
| `src/app/api/client.js` | API configuration | Change BASE_URL |
| `src/app/api/auth.js` | Auth endpoints | Add endpoints |
| `src/app/reducers/authReducer.js` | State management | Add auth properties |
| `src/app/sagas/authSaga.js` | Async logic | Modify workflows |
| `src/screen/auth/Login.js` | Login form | Customize UI |
| `src/screen/auth/Register.js` | Register form | Customize UI |

---

## 🔧 Configuration

### Change API Environment

In `src/app/api/client.js`:

```javascript
// Switch environments
const ENVIRONMENT = 'LOCAL'        // Development
// const ENVIRONMENT = 'STAGING'   // Testing
// const ENVIRONMENT = 'PRODUCTION' // Production
```

### Change Backend URL

```javascript
const API_ENDPOINTS = {
  LOCAL: 'http://YOUR_IP:3000/api',  // ← Change this
  STAGING: 'https://staging.example.com/api',
  PRODUCTION: 'https://api.example.com/api'
}
```

**Note**: On Android emulator, use your computer's IP instead of localhost:
```javascript
LOCAL: 'http://192.168.0.100:3000/api'  // Your computer's IP
```

---

## 🚀 Common Tasks

### Add New API Endpoint

**Step 1**: Add API function in `src/app/api/auth.js`:
```javascript
export const myNewAPI = async (data) => {
  return apiRequest('/my-endpoint', {
    method: 'POST',
    body: data,
    token: token // if protected
  })
}
```

**Step 2**: Create Redux action type:
```javascript
// In reducer
case 'MY_ACTION_SUCCESS':
  return { ...state, data: action.payload }
```

**Step 3**: Create saga handler:
```javascript
function* myActionSaga(action) {
  try {
    const response = yield call(myNewAPI, action.payload)
    yield put({ type: 'MY_ACTION_SUCCESS', payload: response })
  } catch (error) {
    yield put({ type: 'MY_ACTION_FAILURE', payload: error.message })
  }
}
```

**Step 4**: Dispatch from component:
```javascript
dispatch({ type: 'MY_ACTION', payload: data })
```

---

## 🐛 Troubleshooting

### "Cannot connect to API"
```
✅ Check if backend server is running
✅ Check if PORT 3000 is open
✅ Check URL in api/client.js
✅ On Android emulator, use computer IP not localhost
```

### "AsyncStorage error"
```
✅ Stop app and rebuild: npm run android
✅ Check android/build.gradle has maven repo
✅ Clear gradlew cache: cd android && ./gradlew clean
```

### "Redux action not working"
```
✅ Check Redux DevTools browser extension
✅ Verify action type matches in reducer
✅ Check saga is listening to action type
✅ Look at console for error messages
```

### "Token not saving"
```
✅ Check AsyncStorage permissions
✅ Verify token exists in response
✅ Check store.js has auth in whitelist
✅ Ensure PersistGate in App.tsx
```

---

## 📊 Redux Workflow

```
User Action (e.g., Login)
         ↓
Component dispatch({ type: 'LOGIN', payload: data })
         ↓
Saga intercepts LOGIN action
         ↓
API call: loginAPI(email, password)
         ↓
Save token to AsyncStorage
         ↓
Dispatch success: { type: 'LOGIN_SUCCESS', payload: { user, token } }
         ↓
Reducer updates state
         ↓
Component subscribes to state changes
         ↓
Component re-renders with new state
         ↓
Navigate to next screen
```

---

## 💾 Token Management

### Auto-save on Login
```javascript
// Happens automatically in authSaga
yield call(AsyncStorage.setItem, 'authToken', response.token)
```

### Auto-load on App Start
```javascript
// Handled by redux-persist in store.js
// Redux rehydrates from AsyncStorage automatically
```

### Auto-use in Protected Requests
```javascript
// In api/client.js
const token = state.auth.token
apiRequest(endpoint, { token })  // Auto adds Authorization header
```

### Clear on Logout
```javascript
// Happens automatically in authSaga
yield call(AsyncStorage.removeItem, 'authToken')
```

---

## 🔒 Security Checklist

- [ ] Never log sensitive data (tokens, passwords)
- [ ] Use HTTPS in production (not HTTP)
- [ ] Validate input on backend (not just client)
- [ ] Don't hardcode API URLs
- [ ] Implement token expiration
- [ ] Use refresh tokens
- [ ] Implement rate limiting
- [ ] Add request/response logging
- [ ] Clear sensitive data on logout
- [ ] Use secure token storage

---

## 📚 Documentation Files

1. **SETUP_COMPLETION_SUMMARY.md** - What was installed & configured
2. **API_INTEGRATION_README.md** - Complete technical documentation
3. **POSTMAN_SETUP_GUIDE.md** - How to set up and test in Postman
4. **EXAMPLE_BACKEND_API.md** - Reference backend implementation
5. **QUICK_START_GUIDE.md** - This file

---

## 🎓 Next Learning Steps

1. **Databases**: Learn MongoDB/PostgreSQL/Firebase
2. **Authentication**: Implement OAuth, two-factor auth
3. **State Management**: Learn advanced Redux patterns
4. **API Testing**: Master Postman & REST API design
5. **Backend**: Build APIs with Node.js or other frameworks
6. **DevOps**: Deploy to cloud (AWS, Azure, Google Cloud)
7. **Testing**: Write unit & integration tests
8. **Performance**: Implement caching & optimization

---

## ❓ FAQ

**Q: Can I use this without Redux?**  
A: Yes, but Redux makes state management much easier. You'd need to manage state manually.

**Q: Can I change BASE_URL at runtime?**  
A: Yes, add a Redux action to update the URL dynamically.

**Q: How do I implement logout?**  
A: Already implemented! `dispatch({ type: 'LOGOUT' })` clears tokens.

**Q: How do I handle expired tokens?**  
A: Implement `refreshTokenAPI` in the saga - refresh when you get 401 error.

**Q: Can I run backend on different machine?**  
A: Yes, use your machine's IP address instead of localhost.

**Q: How do I test on real device?**  
A: Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to get your IP.

---

## 🎉 YOU'RE ALL SET!

Your app now has:
- ✅ Complete Redux setup
- ✅ API integration ready
- ✅ Authentication screens
- ✅ Token persistence
- ✅ Error handling
- ✅ Async workflows

**Next**: Build your backend API and start building features!

---

**Questions?** Check the detailed documentation in:
- `API_INTEGRATION_README.md`
- `POSTMAN_SETUP_GUIDE.md`
- `EXAMPLE_BACKEND_API.md`

**Last Updated**: March 5, 2026
