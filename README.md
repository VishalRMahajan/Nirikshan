```bash
# Clone repository                                                                        
git clone -b next-ts-shadcn-authjs-prisma https://github.com/ajaykumarn3000/template.git
```

```bash
# Install dependencies
npm install
```

```bash
# Generate a secret for authentication
npx auth secret
```

### Create a New App on Google Cloud

1. Go to the Google Cloud Console and create a new app.
2. Set the **Authorized Redirect URIs** to:
  ```
  http://localhost:3000/api/auth/callback/google
  ```

### Add Environment Variables

Create or update the following files with the required environment variables:

#### `.env.local`
```env
AUTH_SECRET= # Automatically added by `npx auth`. Read more: https://cli.authjs.dev
AUTH_GOOGLE_ID= # Your Google Client ID
AUTH_GOOGLE_SECRET= # Your Google Client Secret
```

#### `.env`
```env
DATABASE_URL= # Your database connection string
```

### Database Setup

Run the following commands to set up and generate the database schema:

```bash
# Apply database migrations
pnpm exec prisma migrate dev
```

```bash
# Generate Prisma client
pnpm exec prisma generate
```
