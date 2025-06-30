# 📧 Email Integration Setup Guide

## 🎯 Quick Setup (5 minutes)

The landing page supports multiple email services. **EmailJS is recommended** for fastest setup.

## 🚀 Option 1: EmailJS (Recommended)

### Why EmailJS?

- ✅ **No backend required** - Works entirely in the frontend
- ✅ **Free tier available** - 200 emails/month
- ✅ **Easy setup** - Takes 5 minutes
- ✅ **Reliable delivery** - Uses your email provider

### Setup Steps

#### 1. Create EmailJS Account

1. Visit [emailjs.com](https://www.emailjs.com/)
2. Click "Sign Up" and create account
3. Verify your email address

#### 2. Add Email Service

1. Go to **Email Services** in dashboard
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (easiest)
   - **Outlook**
   - **Yahoo**
   - **Custom SMTP**
4. Follow the connection steps
5. **Copy the Service ID** (e.g., `service_abc123`)

#### 3. Create Email Template

1. Go to **Email Templates** in dashboard
2. Click **Create New Template**
3. Use this template content:

```html
Subject: New Degentalk Waitlist Signup Hello, A new user has joined the Degentalk waitlist: Email:
{{user_email}} Timestamp: {{timestamp}} Source: {{source}} Message: {{message}} Best regards,
Degentalk Landing Page
```

4. **Copy the Template ID** (e.g., `template_xyz789`)

#### 4. Get Public Key

1. Go to **Account** → **General**
2. Find **Public Key** section
3. **Copy the Public Key** (e.g., `abc123xyz`)

#### 5. Add Environment Variables

Create `.env.local` file in landing-page directory:

```bash
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abc123xyz
```

#### 6. Test Locally

```bash
npm run dev
# Visit http://localhost:5174
# Test the newsletter signup form
```

## 💼 Option 2: ConvertKit (Professional)

### Why ConvertKit?

- ✅ **Email marketing features** - Automation, sequences
- ✅ **Subscriber management** - Tags, segments
- ✅ **Analytics** - Open rates, click tracking
- ❌ **Paid service** - Starts at $29/month

### Setup Steps

#### 1. Create ConvertKit Account

1. Visit [convertkit.com](https://convertkit.com/)
2. Sign up for account (free trial available)
3. Complete onboarding

#### 2. Create Form

1. Go to **Grow** → **Landing Pages & Forms**
2. Click **Create New** → **Form**
3. Choose **Inline** form type
4. Design your form (can be simple)
5. **Copy the Form ID** from URL (e.g., `1234567`)

#### 3. Get API Key

1. Go to **Account** → **Account Settings**
2. Click **API Keys** tab
3. **Copy the API Key** (e.g., `ck_abc123xyz`)

#### 4. Add Environment Variables

```bash
VITE_CONVERTKIT_API_KEY=ck_abc123xyz
VITE_CONVERTKIT_FORM_ID=1234567
```

#### 5. Test Integration

```bash
npm run dev
# Test newsletter signup
# Check ConvertKit dashboard for new subscribers
```

## 🏢 Option 3: Mailchimp (Enterprise)

### Why Mailchimp?

- ✅ **Enterprise features** - Advanced automation
- ✅ **Large scale** - Millions of subscribers
- ✅ **Integrations** - 300+ integrations
- ❌ **Complex setup** - Requires backend proxy
- ❌ **Expensive** - Higher pricing

### Important Note

Mailchimp requires a **backend proxy** due to CORS restrictions. Not recommended for static sites.

### Alternative: Use Vercel Edge Functions

```javascript
// api/mailchimp.js
export default async function handler(request) {
	const { email } = await request.json();

	const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email_address: email,
			status: 'subscribed'
		})
	});

	return new Response(JSON.stringify({ success: response.ok }));
}
```

## 🔧 Development & Testing

### Local Development

```bash
# Copy environment template
cp .env.example .env.local

# Add your email service credentials
# Start development server
npm run dev

# Test email signup at http://localhost:5174
```

### Testing Checklist

- [ ] **Form validation** - Invalid emails show error
- [ ] **Loading state** - Button shows spinner while sending
- [ ] **Success message** - Clear confirmation message
- [ ] **Error handling** - Graceful error messages
- [ ] **Email delivery** - Test with real email address
- [ ] **Console logs** - Check for any errors

### Debug Mode

Add to `.env.local`:

```bash
VITE_DEBUG_EMAIL=true
```

This will log email attempts to browser console.

## 🚀 Production Deployment

### Vercel Environment Variables

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add your email service variables:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
3. Set for **Production**, **Preview**, and **Development**
4. **Redeploy** your project

### Verification Steps

1. **Deploy to Vercel**
2. **Test on live site**
3. **Check email delivery**
4. **Monitor error logs**

## 🎨 Customization

### Email Template Variables

Available in EmailJS templates:

- `{{user_email}}` - Subscriber's email
- `{{timestamp}}` - Signup timestamp
- `{{source}}` - "Degentalk Landing Page"
- `{{message}}` - Custom message

### Custom Success Messages

Edit `src/lib/email.ts`:

```typescript
return {
	success: true,
	message: 'Welcome to the degen family! 🚀'
};
```

### Multiple Email Services

The system automatically tries services in order:

1. EmailJS (if configured)
2. ConvertKit (if configured)
3. Demo mode (if none configured)

## 🔍 Troubleshooting

### Common Issues

#### "Demo mode" message

- **Cause**: No email service configured
- **Fix**: Add environment variables and restart dev server

#### EmailJS 403 error

- **Cause**: Incorrect Service ID or Template ID
- **Fix**: Double-check IDs in EmailJS dashboard

#### ConvertKit 401 error

- **Cause**: Invalid API key
- **Fix**: Regenerate API key in ConvertKit settings

#### CORS errors

- **Cause**: Trying to use Mailchimp directly
- **Fix**: Use EmailJS or ConvertKit instead

#### Form not submitting

- **Cause**: JavaScript errors
- **Fix**: Check browser console for errors

### Support Resources

- **EmailJS Docs**: [emailjs.com/docs](https://www.emailjs.com/docs/)
- **ConvertKit API**: [developers.convertkit.com](https://developers.convertkit.com/)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

## 💡 Pro Tips

### Email Deliverability

- Use **custom domain** for better delivery rates
- Set up **SPF/DKIM** records if using custom SMTP
- Test with **multiple email providers** (Gmail, Outlook, etc.)

### Performance

- EmailJS loads **asynchronously** - no impact on page speed
- Email validation happens **client-side** - instant feedback
- Form submission is **debounced** - prevents double submissions

### Analytics

Track email signups with Google Analytics:

```javascript
// Add to successful signup
gtag('event', 'newsletter_signup', {
	email: email,
	source: 'landing_page'
});
```

---

**🎉 Your Degentalk landing page now has functional email integration!**
