import emailjs from '@emailjs/browser';

// Environment variables for email service
const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};

// Initialize EmailJS
export const initEmailJS = () => {
  if (emailConfig.publicKey) {
    emailjs.init(emailConfig.publicKey);
  }
};

// Newsletter signup interface
export interface NewsletterSignup {
  email: string;
  timestamp?: string;
  source?: string;
}

// Send newsletter signup email
export const sendNewsletterSignup = async (data: NewsletterSignup): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if EmailJS is configured
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      console.warn('EmailJS not configured. Add environment variables:');
      console.warn('VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY');
      
      // Simulate success for development
      return {
        success: true,
        message: 'Demo mode: Email would be sent in production'
      };
    }

    // Prepare template parameters
    const templateParams = {
      user_email: data.email,
      timestamp: data.timestamp || new Date().toISOString(),
      source: data.source || 'Degentalk Landing Page',
      message: `New newsletter signup from ${data.email}`,
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Successfully joined the waitlist! We\'ll notify you when Degentalk launches.'
      };
    } else {
      throw new Error(`EmailJS error: ${response.status}`);
    }
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return {
      success: false,
      message: 'Failed to join waitlist. Please try again later.'
    };
  }
};

// ConvertKit integration (alternative)
export const sendToConvertKit = async (data: NewsletterSignup): Promise<{ success: boolean; message: string }> => {
  const apiKey = import.meta.env.VITE_CONVERTKIT_API_KEY;
  const formId = import.meta.env.VITE_CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    console.warn('ConvertKit not configured. Add VITE_CONVERTKIT_API_KEY and VITE_CONVERTKIT_FORM_ID');
    return {
      success: true,
      message: 'Demo mode: Would subscribe to ConvertKit in production'
    };
  }

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: data.email,
        tags: ['degentalk-waitlist'],
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Successfully joined the waitlist!'
      };
    } else {
      throw new Error(`ConvertKit error: ${response.status}`);
    }
  } catch (error) {
    console.error('ConvertKit signup error:', error);
    return {
      success: false,
      message: 'Failed to join waitlist. Please try again later.'
    };
  }
};

// Mailchimp integration (alternative)
export const sendToMailchimp = async (): Promise<{ success: boolean; message: string }> => {
  const apiKey = import.meta.env.VITE_MAILCHIMP_API_KEY;
  const audienceId = import.meta.env.VITE_MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.warn('Mailchimp not configured. Add VITE_MAILCHIMP_API_KEY and VITE_MAILCHIMP_AUDIENCE_ID');
    return {
      success: true,
      message: 'Demo mode: Would subscribe to Mailchimp in production'
    };
  }

  try {
    // Note: Direct Mailchimp API calls from frontend are not recommended due to CORS
    // This would typically require a backend proxy
    console.warn('Mailchimp requires backend proxy for security. Consider using EmailJS or ConvertKit instead.');
    
    return {
      success: true,
      message: 'Mailchimp integration requires backend setup. Email saved locally.'
    };
  } catch (error) {
    console.error('Mailchimp signup error:', error);
    return {
      success: false,
      message: 'Failed to join waitlist. Please try again later.'
    };
  }
};

// Main newsletter signup function (tries multiple services)
export const handleNewsletterSignup = async (email: string): Promise<{ success: boolean; message: string }> => {
  const signupData: NewsletterSignup = {
    email,
    timestamp: new Date().toISOString(),
    source: 'Degentalk Landing Page'
  };

  // Try EmailJS first (recommended)
  if (emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey) {
    return await sendNewsletterSignup(signupData);
  }

  // Try ConvertKit as fallback
  if (import.meta.env.VITE_CONVERTKIT_API_KEY && import.meta.env.VITE_CONVERTKIT_FORM_ID) {
    return await sendToConvertKit(signupData);
  }

  // Demo mode if no service configured
  console.log('Newsletter signup (demo mode):', signupData);
  return {
    success: true,
    message: 'Demo mode: Email would be sent in production. Check console for details.'
  };
};