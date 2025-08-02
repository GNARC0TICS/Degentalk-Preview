/*
 * WaitlistButton – opens the public Google-Form URL.
 *
 * The URL is taken from the public env-var NEXT_PUBLIC_WAITLIST_FORM_URL.
 * If that variable is missing it falls back to the hard-coded form link.
 */
'use client';

import React from 'react';

const FALLBACK_FORM_URL = 'https://forms.gle/KQjj5eu59eDiCkxa6';

export const WaitlistButton: React.FC<React.ButtonHTMLAttributes<HTMLAnchorElement>> = ({
  className = '',
  ...rest
}) => {
  const formUrl = process.env.NEXT_PUBLIC_WAITLIST_FORM_URL || FALLBACK_FORM_URL;

  return (
    <a
      href={formUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-md bg-gradient-to-br from-pink-500 to-purple-600 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:opacity-90 ${className}`}
      {...rest}
    >
      Join the Waitlist
    </a>
  );
};
