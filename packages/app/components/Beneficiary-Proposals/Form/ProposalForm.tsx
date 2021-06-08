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
import Preview from './Preview';
import NavigationButtons from './NavigationButtons';
import SocialMedia from './SocialMedia';

import useLocalStorageState from 'use-local-storage-state';
import { Toaster } from 'react-hot-toast';

export interface Navigation {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepLimit: number;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

export interface FormData {
  name: string;
  ethereumAddress: string;
  missionStatement: string;
  proofOfOwnership: string;
  profileImage: string;
  headerImage: string;
  additionalImages: string[];
  impactReports: string[];
  socialMediaLinks: string;
}

export default function PropsalForm(): JSX.Element {
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
  const formData = {
    name,
    ethereumAddress,
    missionStatement,
    proofOfOwnership,
    profileImage,
    headerImage,
    additionalImages,
    impactReports,
    socialMediaLinks,
  } as FormData;

  const navigation: Navigation = {
    currentStep,
    setCurrentStep,
    stepLimit,
    setStepLimit,
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      <NavBar />
      <Intro
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
        navigation={navigation}
      />
      <Name
        formData={formData}
        setName={setName}
        navigation={navigation}
        visible={currentStep === 1}
      />
      <EthereumAddress
        formData={formData}
        setEthereumAddress={setEthereumAddress}
        navigation={navigation}
        visible={currentStep === 2}
      />
      <MissionStatement
        formData={formData}
        setMissionStatement={setMissionStatement}
        navigation={navigation}
        visible={currentStep === 3}
      />
      <ProofOfOwnership
        formData={formData}
        setProofOfOwnership={setProofOfOwnership}
        navigation={navigation}
        visible={currentStep === 4}
      />
      <ProfileImage
        formData={formData}
        setProfileImage={setProfileImage}
        navigation={navigation}
        visible={currentStep === 5}
      />
      <HeaderImage
        formData={formData}
        setHeaderImage={setHeaderImage}
        navigation={navigation}
        visible={currentStep === 6}
      />
      <AdditionalImages
        formData={formData}
        setAdditionalImages={setAdditionalImages}
        navigation={navigation}
        visible={currentStep === 7}
      />
      <ImpactReportsAudits
        formData={formData}
        setImpactReports={setImpactReports}
        navigation={navigation}
        visible={currentStep === 8}
      />
      <SocialMedia
        formData={formData}
        setSocialMediaLinks={setSocialMediaLinks}
        navigation={navigation}
        visible={currentStep === 9}
      />
      <Preview
        formData={formData}
        navigation={navigation}
        visible={currentStep === 10}
      />
      <NavigationButtons navigation={navigation} />
      <Toaster />
    </div>
  );
}
