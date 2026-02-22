/**
 * ProgressIndicator - Shows current position in scrollytelling piece
 * 
 * Renders a vertical dot indicator on the side showing which act/step
 * the user is currently viewing.
 */

'use client';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number | null;
  actNumber?: number;
  actTitle?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
  actNumber,
  actTitle,
}) => {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4">
      {/* Act label */}
      {actNumber && (
        <div className="text-right mb-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Act {actNumber}</p>
          {actTitle && <p className="font-playfair text-sm text-amber-50 mt-1 max-w-24">{actTitle}</p>}
        </div>
      )}

      {/* Step indicators */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'bg-amber-500 w-3 h-3 shadow-lg shadow-amber-500/50'
                : index < (currentStep ?? -1)
                  ? 'bg-slate-600'
                  : 'bg-slate-700'
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Step counter */}
      {currentStep !== null && (
        <p className="text-xs text-slate-500 mt-4">
          {currentStep + 1} / {totalSteps}
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;
