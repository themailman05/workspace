import React, { useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import NavBar from '../../components/NavBar/NavBar';
import Intro from '../../components/Beneficiary-Proposals/Form-Pages/Intro';
import Name from '../../components/Beneficiary-Proposals/Form-Pages/Name';
import AdditionalImages from '../../components/Beneficiary-Proposals/Form-Pages/AdditionalImages';
import EthereumAddress from '../../components/Beneficiary-Proposals/Form-Pages/EthereumAddress';
import HeaderImage from '../../components/Beneficiary-Proposals/Form-Pages/HeaderImage';
import ImpactReportsAudits from '../../components/Beneficiary-Proposals/Form-Pages/ImpactReportsAudits';
import MissionStatement from '../../components/Beneficiary-Proposals/Form-Pages/MissionStatement';
import ProfileImage from '../../components/Beneficiary-Proposals/Form-Pages/ProfileImage';
import ProofOfOwnership from '../../components/Beneficiary-Proposals/Form-Pages/ProofOfOwnership';
import Review from '../../components/Beneficiary-Proposals/Form-Pages/Review';
import SocialMediaLinks from '../../components/Beneficiary-Proposals/Form-Pages/SocialMediaLinks';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
interface SocialMediaLinks {
  name: string;
  url: string;
}

export default function BeneficiaryProposal() {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [additionalImages, setAdditionalImages] = useLocalStorageState<string>(
    'additionalImages',
    '',
  );
  const [headerImage, setHeaderImage] = useLocalStorageState<string>(
    'headerImage',
    '',
  );
  const [impactReports, setImpactReports] = useLocalStorageState<string>(
    'impactReports',
    '',
  );

  const [profileImage, setProfileImage] = useLocalStorageState<string>(
    'profileImage',
    '',
  );

  const [socialMediaLinks, setSocialMediaLinks] = useLocalStorageState<
    SocialMediaLinks[]
  >('socialMediaLinks', []);

  const NavigationButtons = () => {
    return (
      <div className="grid justify-items-stretch ...">
      <span className="relative z-0 inline-flex shadow-sm rounded-md justify-self-end">
        <button
          type="button"
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          <span className="sr-only">Next</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        </span>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      <NavBar />

      {/* TODO: Create wrapper component for steps */}
      <Intro currentStep={currentStep} />
      <Name currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <EthereumAddress
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      <MissionStatement
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      <ProofOfOwnership
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      <ProfileImage currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <HeaderImage currentStep={currentStep} />
      <AdditionalImages currentStep={currentStep} />
      <ImpactReportsAudits currentStep={currentStep} />
      <SocialMediaLinks currentStep={currentStep} />
      <Review currentStep={currentStep} />
      {/* TODO: Move these buttons to the bottom right */}
      <p>Current Step: {currentStep} (for debuggin)</p>
      <footer className="h-10 mb-4 mr-4">
        <NavigationButtons />
      </footer>
    </div>
  );
}
