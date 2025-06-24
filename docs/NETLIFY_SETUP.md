# Netlify Frontend Deployment Guide

This guide will help you deploy your MVNO Platform frontend to Netlify with automatic deployments from GitHub.

## Quick Setup (Automated)

Run our automated setup script:

```bash
npm run setup:netlify
```

This script will:
- Install Netlify CLI
- Authenticate with Netlify
- Create and configure your site
- Set up environment variables
- Test deployment
- Configure GitHub integration

## Manual Setup

### 1. Create Netlify Account

1. Go to [Netlify](https://netlify.com) and sign up
2. Connect your GitHub account

### 2. Create New Site

**Option A: From GitHub (Recommended)**
1. Click "New site from Git"
2. Choose GitHub and authorize
3. Select your repository
4. Configure build settings:
   - **Branch**: `main`
   - **Build command**: `npm run build:frontend`
   - **Publish directory**: `packages/frontend/dist`

**Option B: Manual Deploy**
1. Build your frontend locally: `npm run build:frontend`
2. Drag the `packages/frontend/dist` folder to Netlify dashboard

### 3. Configure Environment Variables

In Netlify Dashboard > Site settings > Environment variables, add:

```
REACT_APP_SUPABASE_URL=https://kzifzfzjyhxbbwmpywbe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://api.wingtel.com
REACT_APP_ENVIRONMENT=production
NODE_VERSION=18
```

### 4. Set Up Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add custom domain (e.g., `app.wingtel.com`)
3. Configure DNS with your domain provider
4. Enable HTTPS (automatic with Netlify)

## GitHub Integration

### 1. Automatic Deployments

The included GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`) automatically:
- Builds and tests on every push to `main`
- Deploys to production
- Creates preview deployments for PRs
- Runs Lighthouse performance checks

### 2. Required GitHub Secrets

Add these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

```
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-auth-token
REACT_APP_SUPABASE_URL=https://kzifzfzjyhxbbwmpywbe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://api.wingtel.com
```

To get your `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`:
1. **Site ID**: Found in Site settings > General
2. **Auth Token**: User settings > Applications > Personal access tokens

## Deployment Commands

```bash
# Deploy to production
npm run deploy:frontend

# Deploy preview/test
npm run deploy:frontend:preview

# Deploy to staging
npm run deploy:frontend:staging
```

## Configuration Files

### netlify.toml

The `netlify.toml` file in your project root configures:
- Build settings and environment variables
- Redirects for SPA routing
- Security headers
- Performance optimizations
- Split testing (A/B testing)

### GitHub Actions

The workflow file configures:
- Automated testing and building
- Security audits
- Performance monitoring
- Multi-environment deployments
- PR preview deployments

## Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions │───▶│     Netlify     │
│                 │    │                 │    │                 │
│ - Push to main  │    │ - Build & Test  │    │ - Global CDN    │
│ - Pull Request  │    │ - Deploy        │    │ - HTTPS/SSL     │
│ - Manual deploy │    │ - Performance   │    │ - Custom Domain │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment-Specific Deployments

### Production
- **Branch**: `main`
- **URL**: `https://wingtel-mvno-platform.netlify.app`
- **API**: Production backend
- **Features**: All features enabled

### Staging
- **Branch**: `staging`
- **URL**: `https://staging--wingtel-mvno-platform.netlify.app`
- **API**: Staging backend
- **Features**: Testing environment

### Preview (PR)
- **Trigger**: Pull request
- **URL**: `https://deploy-preview-[PR#]--wingtel-mvno-platform.netlify.app`
- **API**: Development backend
- **Features**: Feature testing

## Performance Optimization

Netlify automatically provides:
- **Global CDN**: 220+ edge locations worldwide
- **Asset Optimization**: Automatic image/CSS/JS optimization
- **Caching**: Intelligent caching with instant invalidation
- **Compression**: Brotli and gzip compression
- **Prerendering**: Optional prerendering for SEO

## Security Features

- **HTTPS by default**: Automatic SSL certificates
- **Security headers**: CSP, HSTS, XSS protection
- **DDoS protection**: Built-in protection
- **Access control**: IP allowlists, password protection
- **Form spam protection**: Built-in honeypot protection

## Monitoring & Analytics

### Built-in Analytics
- Page views and unique visitors
- Top pages and traffic sources
- Performance metrics
- Bandwidth usage

### Lighthouse CI
Automatic performance monitoring on every deployment:
- Performance scores
- Accessibility checks
- SEO optimization
- Best practices compliance

### Custom Monitoring
Add your own analytics:
- Google Analytics
- Mixpanel
- Custom event tracking

## Troubleshooting

### Common Build Issues

1. **Missing environment variables**
   ```
   Solution: Add all REACT_APP_* variables to Netlify dashboard
   ```

2. **Build command fails**
   ```
   Check: netlify.toml build command matches package.json script
   ```

3. **404 on page refresh**
   ```
   Check: SPA redirects are configured in netlify.toml
   ```

### Debug Tools

```bash
# Test build locally
netlify build

# Test functions locally
netlify dev

# Check deploy status
netlify status

# View deploy logs
netlify logs
```

## Costs

### Free Tier Includes:
- 100GB bandwidth/month
- 300 build minutes/month
- 1 concurrent build
- Deploy previews
- Form submissions (100/month)

### Pro Features:
- Unlimited bandwidth
- Background functions
- Split testing
- Password protection
- Advanced analytics

## Next Steps

1. **Custom Domain**: Set up your branded domain
2. **CDN Optimization**: Configure additional performance settings
3. **Monitoring**: Set up alerts and monitoring
4. **Team Access**: Add team members and configure permissions
5. **Backup Strategy**: Set up automated backups

For additional help, see:
- [Netlify Documentation](https://docs.netlify.com)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/#netlify)
- [GitHub Actions with Netlify](https://docs.netlify.com/configure-builds/get-started/#deploy-with-git) 