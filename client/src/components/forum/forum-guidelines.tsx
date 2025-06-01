import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText } from 'lucide-react';

interface ForumGuidelinesProps {
  className?: string;
}

export function ForumGuidelines({ className = '' }: ForumGuidelinesProps) {
  return (
    <Card className={`bg-zinc-900/70 border border-zinc-800 overflow-hidden ${className}`}>
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
        <p className="text-zinc-400 mb-5">
          Please be respectful and follow our community guidelines when posting. These rules help maintain a productive discussion environment.
        </p>
        <Link href="/forum-rules">
          <Button variant="outline" className="border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300">
            <BookOpen className="mr-2 h-4 w-4" />
            Read Guidelines
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 