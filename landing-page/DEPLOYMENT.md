# 🚀 Degentalk Landing Page - Vercel Deployment Guide

## 📋 Quick Deployment Checklist

- [ ] Push code to GitHub repository
- [ ] Connect repository to Vercel
- [ ] Configure environment variables
- [ ] Deploy and verify
- [ ] Set up custom domain (optional)

## 🔗 Step 1: GitHub Repository Setup

### Option A: New Repository

```bash
cd landing-page
git init
git add .
git commit -m "Initial commit: Degentalk landing page"
git branch -M main
git remote add origin https://github.com/yourusername/degentalk-landing.git
git push -u origin main
```

### Option B: Existing Repository

```bash
cd landing-page
git add .
git commit -m "Update: Perfect Degentalk replica landing page"
git push origin main
```

## 🌐 Step 2: Vercel Deployment

### Quick Deploy (Recommended)

1. **Visit**: [vercel.com](https://vercel.com)
2. **Login/Signup**: Connect with GitHub account
3. **Import Project**: Click "New Project"
4. **Select Repository**: Choose your landing page repository
5. **Configure**: Use these settings:

```bash
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### CLI Deployment (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from landing-page directory
cd landing-page
vercel

# Follow the prompts:
# ? Set up and deploy? [Y/n] y
# ? Which scope? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? degentalk-landing
# ? In which directory is your code located? ./
```

## 🔧 Step 3: Environment Variables

### Required Variables

In your Vercel dashboard → Project Settings → Environment Variables:

```bash
# Email Service (Choose one)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# OR ConvertKit
VITE_CONVERTKIT_API_KEY=your_convertkit_api_key
VITE_CONVERTKIT_FORM_ID=your_convertkit_form_id

# OR Mailchimp
VITE_MAILCHIMP_API_KEY=your_mailchimp_api_key
VITE_MAILCHIMP_AUDIENCE_ID=your_mailchimp_audience_id

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Environment Setup Guide

1. **Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add each variable** with Production, Preview, and Development scopes
3. **Redeploy** after adding variables

## 📧 Step 4: Email Service Setup

### Option A: EmailJS (Easiest)

1. **Sign up**: [emailjs.com](https://www.emailjs.com/)
2. **Create service**: Gmail/Outlook/etc.
3. **Create template**: Use these variables:
   ```
   {{user_email}} - Subscriber email
   {{message}} - Optional message
   ```
4. **Get credentials**: Service ID, Template ID, Public Key
5. **Add to Vercel**: Environment variables above

### Option B: ConvertKit (Professional)

1. **Sign up**: [convertkit.com](https://convertkit.com/)
2. **Create form**: For newsletter signup
3. **Get API key**: Account Settings → API Keys
4. **Get form ID**: From form settings
5. **Add to Vercel**: Environment variables above

### Option C: Mailchimp (Enterprise)

1. **Sign up**: [mailchimp.com](https://mailchimp.com/)
2. **Create audience**: For newsletter subscribers
3. **Get API key**: Account → Extras → API Keys
4. **Get audience ID**: Audience → Settings → Audience name and defaults
5. **Add to Vercel**: Environment variables above

## 🎯 Step 5: Custom Domain (Optional)

### Add Custom Domain

1. **Vercel Dashboard** → Project → Settings → Domains
2. **Add Domain**: Enter your domain (e.g., `launch.degentalk.com`)
3. **Configure DNS**: Add these records to your DNS provider:

```bash
Type: CNAME
Name: launch (or @)
Value: cname.vercel-dns.com
```

### SSL Certificate

- **Automatic**: Vercel provides free SSL certificates
- **Custom**: Upload your own certificate if needed

## 🔍 Step 6: Deployment Verification

### Checklist

- [ ] **Homepage loads**: No console errors
- [ ] **Hero section**: Full height with rotating quotes
- [ ] **Email signup**: Form validation works
- [ ] **Email delivery**: Test with real email address
- [ ] **Mobile responsive**: Test on different devices
- [ ] **Performance**: Lighthouse score 90+
- [ ] **Analytics**: Tracking events fire (if configured)

### Testing Commands

```bash
# Test build locally
npm run build
npm run preview

# Test email functionality
# Use browser dev tools to check network requests
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Error: Node version
Solution: Set Node.js version in vercel.json
{
  "functions": {
    "app.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### Environment Variables Not Working

```bash
# Check variable names have VITE_ prefix
# Verify variables are set for all environments
# Redeploy after adding variables
```

#### Email Not Sending

```bash
# Check browser network tab for API errors
# Verify API keys are correct
# Test with curl/Postman first
```

#### Performance Issues

```bash
# Check bundle size: npm run build
# Optimize images: Use WebP format
# Enable compression in vercel.json
```

## 📊 Analytics Integration

### Google Analytics

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
	window.dataLayer = window.dataLayer || [];
	function gtag() {
		dataLayer.push(arguments);
	}
	gtag('js', new Date());
	gtag('config', 'GA_TRACKING_ID');
</script>
```

### Plausible Analytics

```html
<!-- Add to index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🔄 Continuous Deployment

### Automatic Deployments

- **Main branch**: Auto-deploys to production
- **Feature branches**: Auto-deploys to preview URLs
- **Pull requests**: Auto-generates preview deployments

### Deployment Settings

```json
{
	"buildCommand": "npm run build",
	"outputDirectory": "dist",
	"installCommand": "npm install",
	"devCommand": "npm run dev"
}
```

## 📈 Performance Optimization

### Vercel Edge Functions

```javascript
// api/newsletter.js - Edge function for email
export default async function handler(request) {
	// Handle newsletter signup
	// Return JSON response
}
```

### Caching Strategy

```json
// vercel.json
{
	"headers": [
		{
			"source": "/assets/(.*)",
			"headers": [
				{
					"key": "Cache-Control",
					"value": "public, max-age=31536000, immutable"
				}
			]
		}
	]
}
```

## 🎉 Go Live Checklist

- [ ] **DNS propagated**: Domain resolves correctly
- [ ] **SSL active**: HTTPS working without warnings
- [ ] **Email tested**: Newsletter signup functional
- [ ] **Analytics working**: Events tracking properly
- [ ] **Mobile optimized**: Responsive design verified
- [ ] **Performance**: Page speed optimized
- [ ] **SEO ready**: Meta tags and Open Graph configured

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [vercel.com/community](https://vercel.com/community)
- **Email Support**: [vercel.com/support](https://vercel.com/support)

---

**Your Degentalk landing page will be live at: `https://your-project-name.vercel.app`** 🚀
