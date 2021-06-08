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
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';

export interface Navigation {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepLimit: number;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

export interface FormData {
  name: string;
  setName: UpdateState<string>;
  ethereumAddress: string;
  setEthereumAddress: UpdateState<string>;
  missionStatement: string;
  setMissionStatement: UpdateState<string>;
  proofOfOwnership: string;
  setProofOfOwnership: UpdateState<string>;
  profileImage: string;
  setProfileImage: UpdateState<string>;
  headerImage: string;
  setHeaderImage: UpdateState<string>;
  additionalImages: string[];
  setAdditionalImages: UpdateState<string[]>;
  impactReports: string[];
  setImpactReports: UpdateState<string[]>;
  socialMediaLinks: string;
  setSocialMediaLinks: UpdateState<string>;
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
    setName,
    ethereumAddress,
    setEthereumAddress,
    missionStatement,
    setMissionStatement,
    proofOfOwnership,
    setProofOfOwnership,
    profileImage,
    setProfileImage,
    headerImage,
    setHeaderImage,
    additionalImages,
    setAdditionalImages,
    impactReports,
    setImpactReports,
    socialMediaLinks,
    setSocialMediaLinks,
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
        formData={formData}
        navigation={navigation}
      />
      <Name
        formData={formData}
        navigation={navigation}
        visible={currentStep === 1}
      />
      <EthereumAddress
        formData={formData}
        navigation={navigation}
        visible={currentStep === 2}
      />
      <MissionStatement
        formData={formData}
        navigation={navigation}
        visible={currentStep === 3}
      />
      <ProofOfOwnership
        formData={formData}
        navigation={navigation}
        visible={currentStep === 4}
      />
      <ProfileImage
        formData={formData}
        navigation={navigation}
        visible={currentStep === 5}
      />
      <HeaderImage
        formData={formData}
        navigation={navigation}
        visible={currentStep === 6}
      />
      <AdditionalImages
        formData={formData}
        navigation={navigation}
        visible={currentStep === 7}
      />
      <ImpactReportsAudits
        formData={formData}
        navigation={navigation}
        visible={currentStep === 8}
      />
      <SocialMedia
        formData={formData}
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
