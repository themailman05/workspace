import { useState } from 'react';
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
import {
  ArrowCircleRightIcon,
  ArrowCircleLeftIcon,
} from '@heroicons/react/solid';
interface SocialMediaLinks {
  name: string;
  url: string;
}

export default function BeneficiaryProposal() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [name, setName] = useLocalStorageState<string>('name', '');
  const [ethereumAddress, setEthereumAddress] =
    useLocalStorageState<string>('');
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
  const [missionStatement, setMissionStatement] = useLocalStorageState<string>(
    'missionStatement',
    '',
  );
  const [profileImage, setProfileImage] = useLocalStorageState<string>(
    'profileImage',
    '',
  );
  const [proofOfOwnership, setProofOfOwnership] = useLocalStorageState<string>(
    'proofOfOwnership',
    '',
  );
  const [socialMediaLinks, setSocialMediaLinks] = useLocalStorageState<
    SocialMediaLinks[]
  >('socialMediaLinks', []);

  const NextButton = () => {
    return (
      <button
        className="m-5"
        type="button"
        onClick={() => setCurrentStep(currentStep + 1)}
      >
        <ArrowCircleRightIcon className="h-5 w-5 " aria-hidden="true" />
      </button>
    );
  };

  const PrevButton = () => {
    return (
      <button
        className="m-5"
        type="button"
        onClick={() => setCurrentStep(currentStep - 1)}
      >
        <ArrowCircleLeftIcon className="h-5 w-5 " aria-hidden="true" />
      </button>
    );
  };

  return (
    <div className="w-full bg-indigo-200 pb-16">
      <NavBar />
      <div className="pt-12 px-4  sm:px-6 lg:px-8 lg:pt-20 py-20">
        <div className="text-center">
          <p className="mt-2 text-3xl text-indigo-900 sm:text-4xl lg:text-5xl">
            Beneficiary Nomination Proposal
          </p>
        </div>
      </div>
      <h1>Current Step: {currentStep}</h1>
      <Intro currentStep={currentStep} />
      <Name currentStep={currentStep} name={name} setName={setName} />
      <EthereumAddress
        currentStep={currentStep}
        ethereumAddress={ethereumAddress}
        setEthereumAddress={setEthereumAddress}
      />
      <MissionStatement currentStep={currentStep} />
      <ProofOfOwnership currentStep={currentStep} />
      <ProfileImage currentStep={currentStep} />
      <HeaderImage currentStep={currentStep} />
      <AdditionalImages currentStep={currentStep} />
      <ImpactReportsAudits currentStep={currentStep} />
      <SocialMediaLinks currentStep={currentStep} />
      <Review currentStep={currentStep} />
      <div className="object-right">
        <PrevButton />
        <NextButton />
      </div>
    </div>
  );
}
