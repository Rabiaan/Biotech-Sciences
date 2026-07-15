import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, RotateCcw } from "lucide-react";

function ReturnPolicy({ onNavigateHome }) {
  return (
    <div className="bg-[#f3f6ed] text-[#19221f] min-h-screen pt-28 pb-20 selection:bg-[#7a493b]/20">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 bg-white hover:bg-[#19221f] hover:text-[#f3f6ed] text-[#19221f] py-3 px-6 rounded-full border border-[#19221f]/15 text-xs font-display font-semibold uppercase tracking-wider transition-all shadow-sm mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#19221f]/5 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-[#7a493b]" />
              </div>
              <h1 className="font-syne text-3xl md:text-4xl font-bold tracking-tight text-[#19221f]">
                Return Policy
              </h1>
            </div>
            <p className="text-xs text-[#19221f]/40 font-mono uppercase tracking-widest">
              Biotech Sciences
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#19221f]/5 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#e8c9a0]/20 flex items-center justify-center">
              <RotateCcw className="w-7 h-7 text-[#19221f]/60" />
            </div>
            <p className="text-base sm:text-lg text-[#19221f]/80 font-display leading-relaxed max-w-md mx-auto">
              Due to the nature of our products, we can not take returns or exchanges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ReturnPolicy as default };
