import React, { useState } from 'react';
import NavBar from '../../NavBar/NavBar';
import Intro from './Intro';
import Name from './Name';
import AdditionalImages from './AdditionalImages';
import EthereumAddress from './EthereumAddress';
import HeaderImage from './HeaderImage';
import ImpactReportsAudits from './ImpactReportsAudits';
import MissionStatement from './MissionStatement';
import ProfileImage from './ProfileImage';
import ProofOfOwnership from './ProofOfOwnership';
import Review from './Review';
import SocialMediaLinks from './SocialMediaLinks';
import Navigation from './Navigation';

import useLocalStorageState from 'use-local-storage-state';

export default function LandingPage(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLimit, setStepLimit] = useState<number>(1);
  const [name, setName] = useLocalStorageState<string>('name', '');
  const [ethereumAddress, setEthereumAddress] =
    useLocalStorageState<string>('');
  const [missionStatement, setMissionStatement] = useLocalStorageState<string>(
    'missionStatement',
    '',
  );
  const [proofOfOwnership, setProofOfOwnership] = useLocalStorageState<string>(
    'proofOfOwnership',
    '',
  );
  const [profileImage, setProfileImage] = useLocalStorageState<string>(
    'img',
    null,
  );
  const [headerImage, setHeaderImage] = useLocalStorageState<string>(
    'headerimg',
    null,
  );
  const [additionalImages, setAdditionalImages] = useLocalStorageState<
    string[]
  >('additionalimages', []);
  const [impactReports, setImpactReports] = useLocalStorageState<string[]>(
    'impactreports',
    [],
  );
  const [socialMediaLinks, setSocialMediaLinks] = useLocalStorageState<string>(
    'socialMediaLinks',
    '[]',
  );
  return (
    <div className="flex flex-col h-screen justify-between">
      <NavBar />
      {/* TODO: Create wrapper component for text input steps */}
      <Intro
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        setName={setName}
        setEthereumAddress={setEthereumAddress}
        setMissionStatement={setMissionStatement}
        setProofOfOwnership={setProofOfOwnership}
        setProfileImage={setProfileImage}
        setHeaderImage={setHeaderImage}
        setAdditionalImages={setAdditionalImages}
        setImpactReports={setImpactReports}
        setSocialMediaLinks={setSocialMediaLinks}
        name={name}
        stepLimit={stepLimit}
        setStepLimit={setStepLimit}
      />
      <Name
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        name={name}
        setName={setName}
        stepLimit={stepLimit}
        setStepLimit={setStepLimit}
      />
      <EthereumAddress
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        ethereumAddress={ethereumAddress}
        setEthereumAddress={setEthereumAddress}
        setStepLimit={setStepLimit}
      />
      <MissionStatement
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        missionStatement={missionStatement}
        setMissionStatement={setMissionStatement}
        setStepLimit={setStepLimit}
      />
      <ProofOfOwnership
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        proofOfOwnership={proofOfOwnership}
        setProofOfOwnership={setProofOfOwnership}
        setStepLimit={setStepLimit}
      />
      <ProfileImage
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        setStepLimit={setStepLimit}
      />
      <HeaderImage
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        headerImage={headerImage}
        setHeaderImage={setHeaderImage}
        setStepLimit={setStepLimit}
      />
      <AdditionalImages
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        additionalImages={additionalImages}
        setAdditionalImages={setAdditionalImages}
        setStepLimit={setStepLimit}
      />
      <ImpactReportsAudits
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        impactReports={impactReports}
        setImpactReports={setImpactReports}
        setStepLimit={setStepLimit}
      />
      <SocialMediaLinks
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        socialMediaLinks={socialMediaLinks}
        setSocialMediaLinks={setSocialMediaLinks}
        setStepLimit={setStepLimit}
      />
      <Review
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        name={name}
        ethereumAddress={ethereumAddress}
        missionStatement={missionStatement}
        proofOfOwnership={proofOfOwnership}
        profileImage={profileImage}
        headerImage={headerImage}
        additionalImages={additionalImages}
        impactReports={impactReports}
        socialMediaLinks={socialMediaLinks}
        setStepLimit={setStepLimit}
      />
      <Navigation
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        stepLimit={stepLimit}
        setStepLimit={setStepLimit}
      />
    </div>
  );
}
