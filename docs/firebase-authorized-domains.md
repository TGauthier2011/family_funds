# Firebase Authorized Domains Configuration

This guide explains how to configure Firebase Authentication to recognize both your local development environment and your production Firebase App Hosting domain.

## Why This Matters

Firebase Authentication requires that domains be explicitly authorized to prevent unauthorized access. This is especially important for:
- **Email link authentication** - The links must come from authorized domains
- **OAuth redirects** - Social sign-in providers need authorized callback URLs
- **Security** - Prevents malicious sites from using your Firebase project

## Step-by-Step Configuration

### 1. Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-8153861394-74819`
3. Click on **Authentication** in the left sidebar
4. Click on the **Settings** tab (gear icon)
5. Scroll down to **Authorized domains**

### 2. Add Your Domains

You'll see a list of authorized domains. By default, Firebase includes:
- `localhost` (for local development)
- Your Firebase project domain (e.g., `studio-8153861394-74819.firebaseapp.com`)

#### For Local Development

**If `localhost` is not listed**, add it:
1. Click **Add domain**
2. Enter: `localhost`
3. Click **Add**

**Important**: For local development on a custom port (like `localhost:9002`), you typically only need `localhost` - Firebase will accept any port on localhost.

#### For Production (Firebase App Hosting)

When you deploy to Firebase App Hosting, you'll get a domain like:
- `your-app-name.web.app`
- `your-app-name.firebaseapp.com`

Add your production domain:
1. Click **Add domain**
2. Enter your Firebase App Hosting domain (e.g., `your-app-name.web.app`)
3. Click **Add**

**To find your App Hosting domain:**
1. Go to **App Hosting** in Firebase Console
2. Your app's URL will be displayed there

### 3. Custom Domain (Optional)

If you're using a custom domain:
1. Click **Add domain**
2. Enter your custom domain (e.g., `app.yourdomain.com`)
3. Click **Add**
4. Follow Firebase's instructions to verify domain ownership

## Current Configuration

Your app is already configured to automatically use the correct domain:

```typescript
// In LoginForm.tsx - automatically uses current origin
const actionCodeSettings = {
  url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
  handleCodeInApp: true,
};
```

This means:
- **Local**: `http://localhost:9002/login?email=...`
- **Production**: `https://your-app.web.app/login?email=...`

## Verification Checklist

- [ ] `localhost` is in authorized domains list
- [ ] Your Firebase App Hosting domain is in authorized domains list
- [ ] Any custom domains are added
- [ ] Email link authentication is enabled in Authentication → Sign-in method
- [ ] Email/Password authentication is enabled

## Testing

### Test Local Development

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:9002/login`
3. Use the "Email Link" tab
4. Enter your email and click "Send Sign-In Link"
5. Check your email and click the link
6. You should be redirected back to `http://localhost:9002/login` and signed in

### Test Production

1. Deploy your app to Firebase App Hosting
2. Go to your production URL
3. Repeat the same email link flow
4. The link should redirect to your production domain

## Troubleshooting

### Error: "auth/unauthorized-domain"

**Problem**: The domain is not authorized in Firebase Console.

**Solution**: 
1. Check Firebase Console → Authentication → Settings → Authorized domains
2. Add the missing domain
3. Wait a few minutes for changes to propagate
4. Try again

### Email Link Doesn't Work

**Problem**: Email link redirects but sign-in fails.

**Possible Causes**:
1. Domain not authorized (see above)
2. Email link expired (links expire after 1 hour by default)
3. Link already used (email links are single-use)

**Solution**: Request a new email link

### Port-Specific Issues

**Note**: You don't need to add `localhost:9002` separately. Firebase accepts all ports on `localhost` when `localhost` is authorized.

## Additional Resources

- [Firebase Authorized Domains Documentation](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase App Hosting Documentation](https://firebase.google.com/docs/app-hosting)
