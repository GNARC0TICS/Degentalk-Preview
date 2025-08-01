import React from 'react';
import { Send } from 'lucide-react';
import { trackCTAClick } from '@/lib/analytics';

interface PremiumContactButtonProps {
	className?: string;
}

export function PremiumContactButton({ className }: PremiumContactButtonProps) {
	return (
		<a
			href="/contact"
			onClick={() => trackCTAClick('contact_header', 'header')}
			className={`premium-contact-button group ${className || ''}`}
			aria-label="Get in Touch"
		>
			<style jsx>{`
				.premium-contact-button {
					position: relative;
					display: inline-flex;
					align-items: center;
					gap: 0.5rem;
					padding: 0.75rem 1.5rem;
					font-size: 0.875rem;
					font-weight: 500;
					letter-spacing: 0.025em;
					color: #ffffff;
					background: linear-gradient(135deg, #10b981 0%, #059669 100%);
					border-radius: 0.5rem;
					overflow: hidden;
					transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
					box-shadow: 
						0 1px 3px 0 rgba(0, 0, 0, 0.1),
						0 1px 2px 0 rgba(0, 0, 0, 0.06),
						0 0 0 0 transparent;
					transform: translateY(0);
				}

				/* Subtle shine effect */
				.premium-contact-button::before {
					content: '';
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(
						90deg,
						transparent 0%,
						rgba(255, 255, 255, 0.2) 50%,
						transparent 100%
					);
					transition: left 0.6s ease;
				}

				/* Hover effects */
				.premium-contact-button:hover {
					background: linear-gradient(135deg, #059669 0%, #047857 100%);
					transform: translateY(-1px);
					box-shadow: 
						0 4px 6px -1px rgba(0, 0, 0, 0.1),
						0 2px 4px -1px rgba(0, 0, 0, 0.06),
						0 0 0 3px rgba(16, 185, 129, 0.1);
				}

				.premium-contact-button:hover::before {
					left: 100%;
				}

				/* Active state */
				.premium-contact-button:active {
					transform: translateY(0);
					box-shadow: 
						0 1px 3px 0 rgba(0, 0, 0, 0.1),
						0 1px 2px 0 rgba(0, 0, 0, 0.06),
						0 0 0 3px rgba(16, 185, 129, 0.2);
				}

				/* Focus state for accessibility */
				.premium-contact-button:focus {
					outline: none;
					box-shadow: 
						0 4px 6px -1px rgba(0, 0, 0, 0.1),
						0 2px 4px -1px rgba(0, 0, 0, 0.06),
						0 0 0 3px rgba(16, 185, 129, 0.3);
				}

				/* Icon animation */
				.premium-contact-button .icon {
					transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.premium-contact-button:hover .icon {
					transform: translateX(2px);
				}

				/* Premium gradient border effect */
				@keyframes gradient-border {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}

				.premium-contact-button::after {
					content: '';
					position: absolute;
					inset: -2px;
					background: linear-gradient(
						45deg,
						#10b981,
						#059669,
						#10b981,
						#059669
					);
					background-size: 300% 300%;
					border-radius: 0.625rem;
					z-index: -1;
					opacity: 0;
					transition: opacity 0.3s ease;
				}

				.premium-contact-button:hover::after {
					opacity: 0.3;
					animation: gradient-border 3s ease infinite;
				}
			`}</style>
			
			<span>Get in Touch</span>
			<Send className="icon w-4 h-4" />
		</a>
	);
}