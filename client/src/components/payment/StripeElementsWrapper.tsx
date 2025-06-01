import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load the Stripe publishable key from environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Initialize Stripe outside the component to avoid recreating it on every render
let stripePromise: ReturnType<typeof loadStripe> | null = null;

// Function to get or create the Stripe promise
const getStripePromise = () => {
  if (!stripePromise && stripePublicKey) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

type StripeElementsWrapperProps = {
  children: React.ReactNode;
  clientSecret: string;
};

/**
 * A wrapper component that provides Stripe Elements context to its children
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components that need access to Stripe Elements
 * @param {string} props.clientSecret - The client secret from a PaymentIntent or SetupIntent
 */
export const StripeElementsWrapper: React.FC<StripeElementsWrapperProps> = ({ 
  children, 
  clientSecret 
}) => {
  // Don't render without a client secret
  if (!clientSecret) {
    console.error('StripeElementsWrapper: No client secret provided');
    return null;
  }

  // Check if we have a Stripe public key
  if (!stripePublicKey) {
    console.error('Missing Stripe public key. Please make sure VITE_STRIPE_PUBLIC_KEY is set in your environment variables.');
    return (
      <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-md text-red-100">
        <h3 className="text-lg font-medium mb-2">Payment System Error</h3>
        <p>The payment system is not properly configured. Please contact support.</p>
      </div>
    );
  }

  // Get the Stripe promise
  const stripe = getStripePromise();

  // Stripe elements configuration options
  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const, // Use 'as const' to ensure strict type checking
      variables: {
        colorPrimary: '#4F46E5',
        colorBackground: '#18181B',
        colorText: '#F9FAFB',
        colorDanger: '#EF4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  );
};