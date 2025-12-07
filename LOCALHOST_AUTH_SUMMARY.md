# Localhost-Compatible Authentication System

## Overview

This update makes the authentication system work seamlessly in both development (localhost) and production environments. The system automatically detects the environment and adjusts URLs and redirects accordingly.

## Key Features

### 🔧 **Environment Detection**

- Automatically detects if running on localhost
- Uses `NODE_ENV` and `window.location.hostname` for detection
- Centralized utility functions for consistent behavior

### 🏠 **Development Mode Behavior**

- **Store URLs**: `http://store-slug.localhost:3000` instead of `https://store-slug.skillforge.com`
- **Admin Panel**: `http://localhost:3000` instead of `https://admin.skillforge.com`
- **Student Redirects**: Shows development notifications instead of redirecting to external domains
- **Logout**: Redirects to localhost login page

### 🚀 **Production Mode Behavior**

- **Store URLs**: `https://store-slug.skillforge.com` (or custom domains)
- **Admin Panel**: `https://admin.skillforge.com`
- **Student Redirects**: Redirects to actual store websites
- **Logout**: Redirects to appropriate production login pages

## Files Modified

### 1. **Development Utilities** (`lib/dev-utils.ts`)

- New utility file for environment detection
- Centralized URL generation functions
- Development logging and notifications

### 2. **Enhanced Auth Service** (`lib/enhanced-auth.ts`)

- Updated `getSchoolDashboardUrl()` to use localhost in development
- Updated `logout()` method for localhost compatibility
- Added development logging

### 3. **Authentication Hook** (`hooks/useAuthRedirect.ts`)

- Updated to handle localhost redirects properly
- Shows development notifications instead of external redirects
- Better error handling for development mode

### 4. **Login Page** (`app/(auth)/login/page.tsx`)

- Updated student redirect logic for localhost
- Shows development mode notifications
- Redirects students to dashboard in development

## How It Works

### **Environment Detection**

```typescript
function isDevelopmentMode(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  );
}
```

### **URL Generation**

```typescript
// Development: http://store-slug.localhost:3000
// Production: https://store-slug.skillforge.com
function getStoreUrl(storeSlug: string): string {
  if (isDevelopmentMode()) {
    return `http://${storeSlug}.localhost:3000`;
  }
  return `https://${storeSlug}.skillforge.com`;
}
```

### **Student Redirect Handling**

```typescript
if (isDevelopmentMode()) {
  // Show development notification
  logDevInfo('Development mode: Would redirect student to:', storeUrl);
  // Stay on current page or redirect to dashboard
  router.push('/dashboard');
} else {
  // Production: redirect to actual store
  window.location.href = storeUrl;
}
```

## Development Workflow

### **For Developers**

1. **Start Development Server**: `npm run dev`
2. **Access Admin Panel**: `http://localhost:3000`
3. **Test Student Login**: Will show development notifications
4. **Test Store URLs**: Will generate localhost URLs
5. **Check Console**: Development logs will show redirect information

### **For Testing**

1. **Staff Login**: Works normally, redirects to dashboard
2. **Student Login**: Shows development notification, redirects to dashboard
3. **Store URLs**: Generated as localhost URLs
4. **Logout**: Redirects to localhost login

## Production Workflow

### **For Production**

1. **Deploy to Production**: Environment automatically detected
2. **Staff Login**: Works normally, redirects to dashboard
3. **Student Login**: Redirects to actual store websites
4. **Store URLs**: Generated as production URLs
5. **Logout**: Redirects to appropriate production login pages

## Benefits

### **Development Benefits**

- ✅ No external domain dependencies during development
- ✅ Faster development workflow
- ✅ Clear development mode indicators
- ✅ Consistent localhost URLs
- ✅ Better debugging with development logs

### **Production Benefits**

- ✅ Seamless production deployment
- ✅ Proper external redirects for students
- ✅ Correct production URLs
- ✅ Maintains all production functionality

## Testing Checklist

### **Development Mode Testing**

- [ ] Environment detection works correctly
- [ ] Store URLs generate as localhost URLs
- [ ] Student redirects show development notifications
- [ ] Staff redirects work normally
- [ ] Logout redirects to localhost login
- [ ] Development logs appear in console

### **Production Mode Testing**

- [ ] Environment detection works correctly
- [ ] Store URLs generate as production URLs
- [ ] Student redirects go to actual store websites
- [ ] Staff redirects work normally
- [ ] Logout redirects to production login pages
- [ ] No development logs in production

## Configuration

### **Environment Variables**

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

### **Localhost Configuration**

For localhost subdomain testing, you may need to:

1. Add entries to `/etc/hosts` file
2. Configure your development server for subdomain routing
3. Use tools like `dnsmasq` for local DNS resolution

## Troubleshooting

### **Common Issues**

1. **Localhost Subdomains Not Working**
   - Check if your development server supports subdomain routing
   - Verify `/etc/hosts` entries if needed
   - Use IP address instead of localhost if necessary

2. **Environment Detection Issues**
   - Check `NODE_ENV` environment variable
   - Verify `window.location.hostname` in browser
   - Check browser console for detection logs

3. **Redirect Loops**
   - Verify middleware configuration
   - Check authentication service responses
   - Ensure proper error handling

### **Debug Steps**

1. **Check Environment Detection**

   ```javascript
   console.log('NODE_ENV:', process.env.NODE_ENV);
   console.log('Hostname:', window.location.hostname);
   console.log('Is Development:', isDevelopmentMode());
   ```

2. **Check URL Generation**

   ```javascript
   console.log('Store URL:', getStoreUrl('test-store'));
   console.log('Base URL:', getBaseUrl());
   ```

3. **Check Authentication Flow**
   - Monitor browser console for development logs
   - Check network tab for API calls
   - Verify redirect behavior

## Security Considerations

- Development mode is automatically detected
- No sensitive information is logged in development
- Production behavior is maintained
- Authentication checks work in both environments
- Proper error handling prevents information leakage

## Performance Notes

- Environment detection is lightweight
- URL generation is efficient
- Development logs only appear in development
- No performance impact in production

## Support

For issues with localhost compatibility:

1. Check environment detection logs
2. Verify URL generation
3. Test both development and production modes
4. Check browser console for errors
5. Ensure proper configuration

The system is designed to work seamlessly in both environments while maintaining security and performance.
