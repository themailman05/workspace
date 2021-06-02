import React, { useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import Intro from '../../components/Beneficiary-Proposals/Form-Pages/Intro';
import Name from '../../components/Beneficiary-Proposals/Form-Pages/1/Name';
import AdditionalImages from '../../components/Beneficiary-Proposals/Form-Pages/AdditionalImages';
import EthereumAddress from '../../components/Beneficiary-Proposals/Form-Pages/EthereumAddress';
import HeaderImage from '../../components/Beneficiary-Proposals/Form-Pages/HeaderImage';
import ImpactReportsAudits from '../../components/Beneficiary-Proposals/Form-Pages/ImpactReportsAudits';
import MissionStatement from '../../components/Beneficiary-Proposals/Form-Pages/MissionStatement';
import ProfileImage from '../../components/Beneficiary-Proposals/Form-Pages/ProfileImage';
import ProofOfOwnership from '../../components/Beneficiary-Proposals/Form-Pages/ProofOfOwnership';
import Review from '../../components/Beneficiary-Proposals/Form-Pages/Review';
import SocialMediaLinks from '../../components/Beneficiary-Proposals/Form-Pages/SocialMediaLinks';
import Navigation from '../../components/Beneficiary-Proposals/Form-Pages/Navigation';

import useLocalStorageState from 'use-local-storage-state';

export default function BeneficiaryProposal() {
  const [currentStep, setCurrentStep] = useState<number>(0);
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
      />
      <Name
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        name={name}
        setName={setName}
      />
      <EthereumAddress
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        ethereumAddress={ethereumAddress}
        setEthereumAddress={setEthereumAddress}
      />
      <MissionStatement
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        missionStatement={missionStatement}
        setMissionStatement={setMissionStatement}
      />
      <ProofOfOwnership
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        proofOfOwnership={proofOfOwnership}
        setProofOfOwnership={setProofOfOwnership}
      />
      <ProfileImage
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />
      <HeaderImage
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        headerImage={headerImage}
        setHeaderImage={setHeaderImage}
      />
      <AdditionalImages
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        additionalImages={additionalImages}
        setAdditionalImages={setAdditionalImages}
      />
      <ImpactReportsAudits
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        impactReports={impactReports}
        setImpactReports={setImpactReports}
      />
      <SocialMediaLinks
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        socialMediaLinks={socialMediaLinks}
        setSocialMediaLinks={setSocialMediaLinks}
      />
      <Review
        currentStep={currentStep}
        name={name}
        ethereumAddress={ethereumAddress}
        missionStatement={missionStatement}
        proofOfOwnership={proofOfOwnership}
        profileImage={profileImage}
        headerImage={headerImage}
        additionalImages={additionalImages}
        impactReports={impactReports}
        socialMediaLinks={socialMediaLinks}
      />
      <Navigation currentStep={currentStep} setCurrentStep={setCurrentStep} />
    </div>
  );
}
