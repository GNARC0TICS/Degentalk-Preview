import React from 'react';

interface MessageSquareWaveProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function MessageSquareWave({ className, ...props }: MessageSquareWaveProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h.01" />
      <path d="M11 9h2" />
      <path d="M16 9h.01" />
      <path d="M8 13h.01" />
      <path d="M11 12.9v.2" />
      <path d="M13 13s1-1 2 0" />
      <path d="M16 13h.01" />
    </svg>
  );
}