# Audit Logging with Winston + Papertrail

This project now includes comprehensive audit logging that tracks API requests and data changes with both local file storage and Papertrail cloud integration.

## Local Log Files

Logs are stored in the `logs` directory:

- `audit.log` - Detailed audit trail of API actions and data changes
- `combined.log` - All application info-level logs
- `error.log` - Error-level logs only

## Papertrail Integration

To set up Papertrail:

1. Sign up for a free Papertrail account at https://papertrailapp.com/
2. Create a new log destination in Papertrail
3. Add the following variables to your `.env` file:

```
PAPERTRAIL_HOST=logs.papertrailapp.com
PAPERTRAIL_PORT=12345  # The port assigned to you by Papertrail (must be a number)
PAPERTRAIL_HOSTNAME=nodejs-api  # Change this to your app name
```

**Important Notes:**

- The `PAPERTRAIL_PORT` must be numeric (e.g., 12345)
- If these variables are missing, the app will still run but will only log to local files
- Any connection errors with Papertrail will be handled gracefully without crashing the app

## What's Being Logged

The audit logging system captures:

1. **API Access Information**:

   - User ID (admin or customer)
   - User type
   - IP address
   - User agent
   - Endpoint path
   - HTTP method
   - Response status code

2. **Data Changes**:
   - Before/after values for each field
   - Who made the change
   - When the change was made

## Manual Logging in Controllers

For important data changes, you can use the audit service in your controllers:

```javascript
const { logDataChange } = require("../../../utils/audit.service");

// In your controller, after updating a resource
await logDataChange({
  userType: req.admin ? "admin" : "customer",
  userId: req.admin?._id || req.customer._id,
  action: "update",
  resource: "resourceName",
  resourceId: updatedResource._id,
  oldData: originalResource,
  newData: updatedResource,
  message: "Updated resource details",
  req: req, // Passing the request to capture IP and user agent
});
```

## Log Format

The logs are stored in JSON format with consistent fields for easy filtering and searching.

## Viewing Logs

- **Local logs**: Check the files in the `logs` directory
- **Papertrail**: Log in to your Papertrail account and use their web interface to view, search and set up alerts for your logs

## Separating Admin and Customer Logs

The logs include a `userType` field that indicates whether the action was performed by an admin or a customer. You can use this field to filter logs in Papertrail or your local log analysis tool.

## Troubleshooting

If you encounter issues with Papertrail integration:

1. Verify you have the correct host and port in your `.env` file
2. Check your server logs for any Papertrail connection errors
3. Ensure your network allows outbound connections to the Papertrail servers
4. If Papertrail is temporarily unavailable, the app will continue to log locally
