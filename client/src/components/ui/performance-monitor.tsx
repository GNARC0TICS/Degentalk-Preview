import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@app/utils/utils';
import { Activity, Zap, Database, Clock } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  itemsLoaded: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  itemCount: number;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitor({
  itemCount,
  className,
  position = 'bottom-right'
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    itemsLoaded: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Monitor FPS
  useEffect(() => {
    let animationId: number;
    
    const measureFPS = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTimeRef.current;
      
      if (delta >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameRef.current * 1000) / delta),
          itemsLoaded: itemCount
        }));
        
        frameRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      frameRef.current++;
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => cancelAnimationFrame(animationId);
  }, [itemCount]);

  // Monitor memory usage (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1048576) // Convert to MB
        }));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-50 bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 rounded-lg shadow-xl',
        'transition-all duration-300',
        positionClasses[position],
        isMinimized ? 'w-12 h-12' : 'w-64',
        className
      )}
    >
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute top-2 right-2 text-zinc-400 hover:text-white"
      >
        {isMinimized ? '📊' : '—'}
      </button>

      {!isMinimized && (
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300 mb-2">Performance Monitor</h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-zinc-400">
                <Zap className="h-3 w-3" />
                FPS
              </span>
              <span className={cn('font-mono', getFPSColor(metrics.fps))}>
                {metrics.fps}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-zinc-400">
                <Database className="h-3 w-3" />
                Items
              </span>
              <span className="font-mono text-zinc-300">
                {metrics.itemsLoaded}
              </span>
            </div>

            {metrics.memoryUsage !== undefined && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Activity className="h-3 w-3" />
                  Memory
                </span>
                <span className="font-mono text-zinc-300">
                  {metrics.memoryUsage} MB
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="h-3 w-3" />
                Render
              </span>
              <span className="font-mono text-zinc-300">
                {metrics.renderTime.toFixed(1)} ms
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              {metrics.fps < 30 && (
                <p className="text-yellow-400">⚠️ Low FPS detected</p>
              )}
              {metrics.itemsLoaded > 100 && (
                <p className="text-blue-400">💡 Consider pagination</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;