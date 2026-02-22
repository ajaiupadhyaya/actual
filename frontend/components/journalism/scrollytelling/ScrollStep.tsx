/**
 * ScrollStep - Individual scroll step container
 * 
 * Renders a narrative text block that appears when scrolled into view.
 * Pairs with a sticky visualization on the left side.
 */

'use client';

interface ScrollStepProps {
  id: string;
  index: number;
  title?: string;
  content: React.ReactNode;
  isActive?: boolean;
  children?: React.ReactNode; // Visualization content passed as children
}

export const ScrollStep: React.FC<ScrollStepProps> = ({
  id,
  index,
  title,
  content,
  isActive = false,
  children,
}) => {
  return (
    <div
      data-scrollama-step
      data-step-index={index}
      id={id}
      className={`scroll-step transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <div className="grid grid-cols-12 gap-6 items-start min-h-screen py-12">
        {/* Sticky visualization container (left 60%) */}
        <div className="col-span-12 lg:col-span-7 sticky top-0 h-screen flex items-center">
          {children ? (
            children
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black rounded-lg border border-slate-700">
              <span className="text-slate-500 text-sm">Visualization {index + 1}</span>
            </div>
          )}
        </div>

        {/* Scrolling narrative text (right 40%) */}
        <div className="col-span-12 lg:col-span-5 py-16">
          {title && (
            <h3 className="font-playfair text-2xl md:text-3xl text-amber-50 mb-6 leading-tight">
              {title}
            </h3>
          )}
          
          <div className="prose prose-invert max-w-none font-crimson-text-serif text-base md:text-lg leading-relaxed text-slate-200">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollStep;
