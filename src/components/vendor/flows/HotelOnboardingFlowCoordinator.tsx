import React from 'react';
import { CommonFlowHeader } from '../../common/CommonFlowHeader';
import { HotelPartnerOnboardingForm } from '../../routripo/HotelPartnerOnboardingForm';

export interface HotelOnboardingFlowCoordinatorProps {
  onClose: () => void;
  onSuccess?: (listingData: any) => void;
  isMr?: boolean;
}

/**
 * Dedicated Full-Page Flow Coordinator for Hotel & Resort Partner Onboarding.
 * Replaces in-page embedding with a focused full-screen workflow featuring
 * the CommonFlowHeader with Back (<) and Close (X) buttons.
 */
export const HotelOnboardingFlowCoordinator: React.FC<HotelOnboardingFlowCoordinatorProps> = ({
  onClose,
  onSuccess,
  isMr = false
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col">
      <CommonFlowHeader
        title={isMr ? 'हॉटेल व रिसॉर्ट पार्टनर नोंदणी' : 'Hotel & Resort Partner Onboarding'}
        subtitle={isMr ? '८-स्तरीय प्रमाणित हॉटेल लिस्टिंग विझार्ड (SAC 996311 GST व IGST सह)' : '8-Step Certified Hotel Listing Wizard (SAC 996311 with Live GST & IGST)'}
        onBack={onClose}
        onClose={onClose}
        backAriaLabel="Back to inventory"
        closeAriaLabel="Close and return to inventory"
      />

      <main className="max-w-4xl mx-auto w-full flex-1 px-3 sm:px-6 py-4 pb-20">
        <HotelPartnerOnboardingForm
          lang={isMr ? 'mr' : 'en'}
          onCancel={onClose}
          onSuccess={(data) => {
            onSuccess?.(data);
            onClose();
          }}
        />
      </main>
    </div>
  );
};

export default HotelOnboardingFlowCoordinator;
