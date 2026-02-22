/**
 * ScrollamaWrapper - Orchestrates scroll-triggered animations
 * 
 * Wraps Scrollama library to detect when scroll steps come into view
 * and triggers state updates in consuming components.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Scrollama from 'scrollama';

interface ScrollStep {
  id: string;
  data?: Record<string, any>;
}

interface ScrollamaWrapperProps {
  steps: ScrollStep[];
  threshold?: number; // 0-1, where 0 = top of viewport, 1 = bottom
  offset?: number; // Offset from threshold (0-1 of viewport height)  
  onStepEnter?: (step: ScrollStep, index: number) => void;
  onStepExit?: (step: ScrollStep, index: number) => void;
  onProgress?: (progress: { index: number; progress: number }) => void;
  children: React.ReactNode;
}

export const ScrollamaWrapper: React.FC<ScrollamaWrapperProps> = ({
  steps,
  threshold = 0.5,
  offset = 0,
  onStepEnter,
  onStepExit,
  onProgress,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollamaRef = useRef<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Scrollama
    const scroller = new (Scrollama as any)();
    scrollamaRef.current = scroller;

    scroller
      .setup({
        step: '[data-scrollama-step]',
        threshold,
        offset,
        debug: false,
      })
      .onStepEnter((response: any) => {
        const stepIndex = parseInt(response.element.getAttribute('data-step-index') || '0', 10);
        const step = steps[stepIndex];
        
        setCurrentStepIndex(stepIndex);
        onStepEnter?.(step, stepIndex);
      })
      .onStepExit((response: any) => {
        const stepIndex = parseInt(response.element.getAttribute('data-step-index') || '0', 10);
        const step = steps[stepIndex];
        
        if (response.direction === 'down') {
          // When exiting downward, the next step is entering
        } else {
          // When exiting upward, we're going back
        }
        
        onStepExit?.(step, stepIndex);
      })
      .onProgress((response: any) => {
        onProgress?.(response);
      });

    // Handle window resize
    const handleResize = () => {
      scroller.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scroller.destroy();
    };
  }, [steps, threshold, offset, onStepEnter, onStepExit, onProgress]);

  return (
    <div ref={containerRef} className="scrollama-container">
      {children}
    </div>
  );
};

export default ScrollamaWrapper;
