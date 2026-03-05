# POSTMAN API SETUP GUIDE

## **1. CREATE ENVIRONMENTS**

### Step 1: Create Local Environment
1. Open Postman
2. Click **Environments** (top-left icon)
3. Click **+** to create new environment
4. Name it: `Local`
5. Add Variables:
   - **Variable Name**: `BASE_URL`
   - **Initial Value**: `http://localhost:3000/api`
   - **Current Value**: `http://localhost:3000/api`
6. Click **Save**

### Step 2: Create Staging Environment
1. Click **+** to create new environment
2. Name it: `Staging`
3. Add Variables:
   - **Variable Name**: `BASE_URL`
   - **Initial Value**: `https://staging-api.example.com/api`
   - **Current Value**: `https://staging-api.example.com/api`
4. Click **Save**

### Step 3: Create Production Environment
1. Click **+** to create new environment
2. Name it: `Production`
3. Add Variables:
   - **Variable Name**: `BASE_URL`
   - **Initial Value**: `https://api.example.com/api`
   - **Current Value**: `https://api.example.com/api`
4. Click **Save**

---

## **2. ADD AUTHORIZATION TOKEN VARIABLE**

In each environment, add:
- **Variable Name**: `authToken`
- **Initial Value**: (leave empty)
- **Current Value**: (leave empty)

This will store the token returned from login.

---

## **3. CREATE API ENDPOINTS**

### **A. LOGIN ENDPOINT**

**Request Details:**
```
Method: POST
URL: {{BASE_URL}}/login
```

**Headers:**
```
Accept: application/json
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Example Response (Success):**
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save Token Automatically (Tests Tab):**
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("authToken", jsonData.token);
  console.log("Token saved:", jsonData.token);
}
```

---

### **B. REGISTER ENDPOINT**

**Request Details:**
```
Method: POST
URL: {{BASE_URL}}/register
```

**Headers:**
```
Accept: application/json
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "fullName": "John Doe",
  "email": "test@example.com",
  "password": "password123"
}
```

**Example Response (Success):**
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save Token Automatically (Tests Tab):**
```javascript
if (pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("authToken", jsonData.token);
  console.log("Token saved:", jsonData.token);
}
```

---

### **C. GET CURRENT USER ENDPOINT**

**Request Details:**
```
Method: GET
URL: {{BASE_URL}}/me
```

**Headers:**
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

**Example Response (Success):**
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "test@example.com",
    "createdAt": "2026-03-05T10:00:00Z"
  }
}
```

---

### **D. LOGOUT ENDPOINT**

**Request Details:**
```
Method: POST
URL: {{BASE_URL}}/logout
```

**Headers:**
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

**Body:** (empty or {})

**Example Response (Success):**
```json
{
  "message": "Logged out successfully"
}
```

**Clear Token (Tests Tab):**
```javascript
if (pm.response.code === 200) {
  pm.environment.set("authToken", "");
  console.log("Token cleared");
}
```

---

### **E. REFRESH TOKEN ENDPOINT**

**Request Details:**
```
Method: POST
URL: {{BASE_URL}}/refresh-token
```

**Headers:**
```
Accept: application/json
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Example Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save New Token (Tests Tab):**
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("authToken", jsonData.token);
  console.log("Token refreshed");
}
```

---

## **4. WORKFLOW EXAMPLE**

1. **Select Environment**: Choose `Local` (top-right corner)
2. **Register**: POST to `/register` with new user data
3. **Login**: POST to `/login` with email/password (token auto-saved)
4. **Get Profile**: GET `/me` with saved token
5. **Logout**: POST `/logout` to clear session (token cleared)

---

## **5. COMMON HEADERS REFERENCE**

```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

---

## **6. TESTING WITH SCRIPTS**

### Pre-request Script (Optional)
```javascript
// Log environment info
console.log("Using environment:", pm.environment.name);
console.log("Base URL:", pm.environment.get("BASE_URL"));
```

### Tests Script (Response Validation)
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is valid JSON", function () {
  pm.response.to.be.json;
});

pm.test("Response has user data", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('user');
});
```

---

## **QUICK REFERENCE TABLE**

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/login` | POST | ❌ No | Login with email/password |
| `/register` | POST | ❌ No | Create new account |
| `/me` | GET | ✅ Yes | Get current user profile |
| `/logout` | POST | ✅ Yes | Logout and invalidate token |
| `/refresh-token` | POST | ❌ No | Get new access token |

---

## **ERROR RESPONSES**

### 401 Unauthorized
```json
{
  "message": "Invalid email or password",
  "status": 401
}
```

### 422 Unprocessable Entity (Validation Error)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

### 500 Server Error
```json
{
  "message": "Internal server error",
  "status": 500
}
```

---

## **NOTES**

- Replace `http://localhost:3000/api` with your actual backend URL
- Always include `Authorization: Bearer {{authToken}}` for protected endpoints
- Tokens are typically short-lived (15-30 minutes)
- Use refresh tokens to get new access tokens
- Test each endpoint with the corresponding environment
