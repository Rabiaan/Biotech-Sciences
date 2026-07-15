import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, Shield } from "lucide-react";

function PrivacyPolicy({ onNavigateHome }) {
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
                <Shield className="w-5 h-5 text-[#7a493b]" />
              </div>
              <h1 className="font-syne text-3xl md:text-4xl font-bold tracking-tight text-[#19221f]">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xs text-[#19221f]/40 font-mono uppercase tracking-widest">
              Biotech Sciences
            </p>
          </div>

          <p className="text-sm text-[#19221f]/75 font-display leading-relaxed">
            Biotech Sciences is committed to protecting the privacy of our users. This Privacy Policy outlines the types of personal information we collect, how it is used, and the measures we take to ensure its security.
          </p>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#19221f]/5 shadow-sm space-y-3">
              <h3 className="font-syne text-base font-bold text-[#19221f]">Information Collection</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                We may collect personal information such as name, email address, shipping address, and payment details when you make a purchase or interact with our website.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#19221f]/5 shadow-sm space-y-3">
              <h3 className="font-syne text-base font-bold text-[#19221f]">Use of Information</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                We use the collected information to process orders, provide customer support, personalize user experience, and send promotional communications.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#19221f]/5 shadow-sm space-y-3">
              <h3 className="font-syne text-base font-bold text-[#19221f]">Data Security</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                We employ industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#19221f]/5 shadow-sm space-y-3">
              <h3 className="font-syne text-base font-bold text-[#19221f]">Third-Party Disclosure</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#19221f]/5 shadow-sm space-y-3">
              <h3 className="font-syne text-base font-bold text-[#19221f]">Cookie Policy</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                Our website may use cookies to enhance user experience. You can choose to disable cookies in your browser settings, although this may affect certain functionalities of the site.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#19221f]/5 shadow-sm space-y-3">
              <h3 className="font-syne text-base font-bold text-[#19221f]">Changes to This Policy</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                We reserve the right to update or modify this Privacy Policy at any time. Any changes will be reflected on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PrivacyPolicy as default };
