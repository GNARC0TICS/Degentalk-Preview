import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForumGuidelinesProps {
  className?: string;
}

export function ForumGuidelines({ className = '' }: ForumGuidelinesProps) {
  return (
    <Card className={`bg-zinc-900/70 border border-zinc-800 overflow-hidden hover:border-emerald-500/30 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2 text-zinc-400" />
          Forum Guidelines
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Community rules and posting etiquette
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-6 pt-2">
        <p className="text-zinc-400 mb-4">
          Please be respectful and follow our community guidelines when posting. These rules help maintain a productive discussion environment.
        </p>
        
        {/* Quick guidelines preview */}
        <motion.div 
          className="space-y-2 mb-5 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center text-zinc-500">
            <Shield className="h-3.5 w-3.5 mr-2 text-emerald-400" />
            <span>Be respectful to all members</span>
          </div>
          <div className="flex items-center text-zinc-500">
            <Users className="h-3.5 w-3.5 mr-2 text-cyan-400" />
            <span>Keep discussions on-topic</span>
          </div>
        </motion.div>
        
        <Link href="/forum-rules">
          <Button 
            variant="outline" 
            className="border-zinc-700 bg-zinc-800/40 hover:bg-emerald-900/20 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-300 transition-all group"
          >
            <BookOpen className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            Read Full Guidelines
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 