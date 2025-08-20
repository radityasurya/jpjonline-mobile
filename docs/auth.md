# Authentication API Documentation

This document provides comprehensive API documentation for authentication endpoints that can be used by mobile applications and other clients.

## Base URL

```
Production: https://jpjonline.com/api
Development: http://localhost:3000/api
```

## Authentication Endpoints

### 1. User Signup

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "MySecurePassword123",
  "confirmPassword": "MySecurePassword123",
  "acceptTerms": true
}
```

**Request Body Schema:**
- `name` (string, required): User's full name (1-100 characters)
- `email` (string, required): Valid email address
- `password` (string, required): Password (minimum 6 characters)
- `confirmPassword` (string, required): Must match password
- `acceptTerms` (boolean, required): Must be `true`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "user_123456789",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": true,
    "premiumUntil": null,
    "createdAt": "2025-01-20T12:00:00.000Z"
  },
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed in body",
  "message": "Please check the provided data and try again",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address",
      "code": "invalid_string"
    }
  ],
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**400 - Email Already Exists:**
```json
{
  "success": false,
  "error": "An account with this email address already exists. Please use a different email or try logging in.",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Example cURL:**
```bash
curl -X POST https://jpjonline.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "MySecurePassword123",
    "confirmPassword": "MySecurePassword123",
    "acceptTerms": true
  }'
```

---

### 2. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request a password reset link to be sent via email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Request Body Schema:**
- `email` (string, required): Valid email address of the account

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": null,
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Rate Limited Response (429):**
```json
{
  "success": false,
  "error": "Too many password reset requests. Please wait before trying again.",
  "details": "You can make 3 more attempts. Try again in 15 minutes.",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Example cURL:**
```bash
curl -X POST https://jpjonline.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Notes:**
- For security reasons, the API always returns success even if the email doesn't exist
- Rate limited to 3 requests per hour per email address
- Reset links expire after 15 minutes
- Users will receive an email with a reset link if their account exists

---

### 3. Verify Reset Token

**Endpoint:** `GET /api/auth/reset-password?token={token}`

**Description:** Verify if a password reset token is valid

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `token` (string, required): The reset token from the email link

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset token is valid",
  "data": {
    "valid": true
  },
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Invalid Token Response (400):**
```json
{
  "success": false,
  "error": "Invalid or expired reset token",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Example cURL:**
```bash
curl -X GET "https://jpjonline.com/api/auth/reset-password?token=abc123def456ghi789"
```

---

### 4. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Complete the password reset process with a new password

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "abc123def456ghi789",
  "password": "MyNewSecurePassword123",
  "confirmPassword": "MyNewSecurePassword123"
}
```

**Request Body Schema:**
- `token` (string, required): The reset token from the email link
- `password` (string, required): New password (minimum 6 characters)
- `confirmPassword` (string, required): Must match the new password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "data": null,
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed in body",
  "message": "Please check the provided data and try again",
  "errors": [
    {
      "field": "confirmPassword",
      "message": "Passwords don't match",
      "code": "custom"
    }
  ],
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**400 - Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid or expired reset token",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

**Example cURL:**
```bash
curl -X POST https://jpjonline.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456ghi789",
    "password": "MyNewSecurePassword123",
    "confirmPassword": "MyNewSecurePassword123"
  }'
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional details (optional)",
  "errors": [], // Validation errors array (optional)
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (for signup)
- `400` - Bad Request (validation errors, invalid data)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

The following rate limits apply:

- **Signup**: 5 requests per hour per IP
- **Forgot Password**: 3 requests per hour per email
- **Reset Password**: 5 requests per hour per IP

When rate limited, you'll receive a `429` status code with details about when you can try again.

## Security Notes

1. **HTTPS Required**: All API calls must use HTTPS in production
2. **Token Expiry**: Reset tokens expire after 15 minutes
3. **Single Use**: Reset tokens can only be used once
4. **Rate Limiting**: Aggressive rate limiting prevents abuse
5. **Email Privacy**: The forgot password endpoint doesn't reveal if an email exists
6. **Password Requirements**: Minimum 6 characters (consider stronger requirements for production)

## Mobile App Integration Examples

### React Native Example

```javascript
// Signup
const signup = async (userData) => {
  try {
    const response = await fetch('https://jpjonline.com/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Signup successful:', result.data);
      return { success: true, user: result.data };
    } else {
      console.error('Signup failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error' };
  }
};

// Forgot Password
const forgotPassword = async (email) => {
  try {
    const response = await fetch('https://jpjonline.com/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    return { success: response.ok, message: result.message };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

// Reset Password
const resetPassword = async (token, password, confirmPassword) => {
  try {
    const response = await fetch('https://jpjonline.com/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password, confirmPassword }),
    });
    
    const result = await response.json();
    return { success: response.ok, message: result.message };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

### Flutter/Dart Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'https://jpjonline.com/api';
  
  static Future<Map<String, dynamic>> signup({
    required String name,
    required String email,
    required String password,
    required String confirmPassword,
    required bool acceptTerms,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'confirmPassword': confirmPassword,
          'acceptTerms': acceptTerms,
        }),
      );
      
      final result = jsonDecode(response.body);
      
      return {
        'success': response.statusCode == 201,
        'data': result,
      };
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: $e',
      };
    }
  }
  
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      
      final result = jsonDecode(response.body);
      
      return {
        'success': response.statusCode == 200,
        'message': result['message'],
      };
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: $e',
      };
    }
  }
}
```

## Testing

You can test these endpoints using the provided cURL examples or tools like Postman. Make sure to:

1. Use the correct base URL for your environment
2. Include proper Content-Type headers
3. Handle rate limiting appropriately
4. Test both success and error scenarios

For development, you can use the test email functionality at `/test/email` to verify email delivery without sending actual emails.