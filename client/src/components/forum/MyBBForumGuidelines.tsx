import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface MyBBForumGuidelinesProps {
  className?: string;
}

export function MyBBForumGuidelines({ className = '' }: MyBBForumGuidelinesProps) {
  return (
    <div className={`mybb-forum-category mb-4 ${className}`}>
      <div className="mybb-category-header mybb-category-red">
        <div className="mybb-category-title">Forum Rules</div>
      </div>
      
      <div className="mybb-stats-content">
        <div className="mb-3">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Please read and follow our community guidelines. These rules ensure a positive experience for all members.
          </p>
        </div>

        {/* Quick rules */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="text-zinc-400">Be respectful and constructive in discussions</span>
          </div>
          
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="text-zinc-400">Keep content relevant to the forum topic</span>
          </div>
          
          <div className="flex items-start gap-2 text-xs">
            <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-zinc-400">No spam, scams, or malicious content</span>
          </div>
          
          <div className="flex items-start gap-2 text-xs">
            <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-zinc-400">No harassment or personal attacks</span>
          </div>
        </div>

        {/* Warning box */}
        <div className="bg-red-950/30 border border-red-900/50 rounded p-2 mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="text-red-300 font-semibold">Warning:</span>
              <span className="text-zinc-400 ml-1">
                Violation of rules may result in temporary or permanent ban
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-3 text-xs">
          <Link 
            to="/forum-rules" 
            className="text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            <Shield className="w-3 h-3 inline mr-1" />
            Full Rules
          </Link>
          <span className="text-zinc-600">•</span>
          <Link 
            to="/contact" 
            className="text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            Report Issue
          </Link>
        </div>
      </div>
    </div>
  );
}