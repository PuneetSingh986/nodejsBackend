# Admin API Curl Examples

## Initialize Admin (First Time Setup)

```bash
curl -X POST http://localhost:5000/api/v1/admin/auth/init \
  -H "Content-Type: application/json"
```

This creates the initial super-admin with the following credentials:

- Email: admin@example.com (or the value of DEFAULT_ADMIN_EMAIL environment variable)
- Password: admin123 (or the value of DEFAULT_ADMIN_PASSWORD environment variable)

## Admin Login

```bash
curl -X POST http://localhost:5000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Expected response:

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "admin": {
      "id": "60e6f5b3c2f8a52a94b4f7a1",
      "name": "System Administrator",
      "email": "admin@example.com",
      "role": "super-admin",
      "permissions": {
        "customers": {
          "read": true,
          "write": true,
          "delete": true
        },
        "orders": {
          "read": true,
          "write": true,
          "delete": true
        },
        "products": {
          "read": true,
          "write": true,
          "delete": true
        }
      }
    }
  }
}
```

## Get Admin Profile

```bash
curl -X GET http://localhost:5000/api/v1/admin/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Admin Logout

```bash
curl -X GET http://localhost:5000/api/v1/admin/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

# Important Notes

1. In a production environment, you should:

   - Use HTTPS for all API calls
   - Change the default admin credentials immediately
   - Restrict access to the /init endpoint or remove it after first use

2. The admin login provides a JWT token that includes:

   - Admin ID
   - Admin role
   - An "isAdmin" flag set to true

3. Role-based permissions are automatically assigned based on the admin's role:
   - super-admin: All permissions
   - admin: Read/write but not delete
   - manager: Read for all, write for customers and orders
   - support: Read-only for customers and orders
   - content-manager: Read/write for products only
