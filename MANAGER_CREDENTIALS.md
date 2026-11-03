# Manager Login Credentials

## Application Access

**Role:** MANAGER

## Default Local Development Account

| Field | Value |
|---|---|
| Email | manager@example.com |
| Password | Configure through `MANAGER_PASSWORD` in `.env` |

## Login Instructions

1. Start the backend application.
2. Start the frontend application.
3. Open the application login page.
4. Enter the configured Manager email and password.
5. Login to access the Manager dashboard.

## Environment Configuration

Configure the following variables in the backend `.env` file:

```dotenv
MANAGER_NAME=System Manager
MANAGER_EMAIL=manager@example.com
MANAGER_PASSWORD=Manager@123
```

The application uses these environment variables to bootstrap the Manager account.


