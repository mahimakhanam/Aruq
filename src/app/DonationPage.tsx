import React from 'react';
import { Layout } from './Layout';
import { Heart, ExternalLink, ShieldCheck } from 'lucide-react';

const DonationPage = () => {
  return (
    <Layout>
      <div className="bg-stone-50 min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center relative">
          <div className="h-32 bg-pal-red flex items-center justify-center">
            <Heart className="w-16 h-16 text-white fill-current animate-pulse" />
          </div>

          <div className="p-10 space-y-6">
            <h1 className="text-3xl font-bold text-stone-800">
              Support Our Heritage
            </h1>

            <p className="text-stone-600 text-lg leading-relaxed">
              A&apos;ruq is dedicated to preserving Palestinian culture,
              literature, and historical memory. To support humanitarian and
              cultural preservation efforts, users are redirected to the official
              Emirates Red Crescent portal.
            </p>

            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 text-left space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-pal-green shrink-0 mt-1" />

                <div>
                  <h3 className="font-bold text-stone-800">
                    Official Donation Channel
                  </h3>

                  <p className="text-sm text-stone-500">
                    All donations are completed securely through the official
                    Emirates Red Crescent website. A&apos;ruq does not collect
                    payment details directly.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://www.emiratesrc.ae/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-pal-red hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-transform hover:scale-105"
            >
              Donate via Emirates Red Crescent
              <ExternalLink className="w-5 h-5" />
            </a>

            <p className="text-xs text-stone-400 mt-6">
              You will be redirected to an external website in a new browser tab.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DonationPage;