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
import SocialMediaLinks from './SocialMediaLinks';
import NavigationButtons from './NavigationButtons';

import useLocalStorageState from 'use-local-storage-state';
import { Toaster } from 'react-hot-toast';

// TODO: Save last completed step to local storage

export interface Navigation {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepLimit: number;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
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
        name={name}
        setName={setName}
        navigation={navigation}
        visible={currentStep === 1}
      />
      <EthereumAddress
        ethereumAddress={ethereumAddress}
        setEthereumAddress={setEthereumAddress}
        navigation={navigation}
        visible={currentStep === 2}
      />
      <MissionStatement
        missionStatement={missionStatement}
        setMissionStatement={setMissionStatement}
        navigation={navigation}
        visible={currentStep === 3}
      />
      <ProofOfOwnership
        proofOfOwnership={proofOfOwnership}
        setProofOfOwnership={setProofOfOwnership}
        navigation={navigation}
        visible={currentStep === 4}
      />
      <ProfileImage
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        navigation={navigation}
        visible={currentStep === 5}
      />
      <HeaderImage
        headerImage={headerImage}
        setHeaderImage={setHeaderImage}
        navigation={navigation}
        visible={currentStep === 6}
      />
      <AdditionalImages
        additionalImages={additionalImages}
        setAdditionalImages={setAdditionalImages}
        navigation={navigation}
        visible={currentStep === 7}
      />
      <ImpactReportsAudits
        impactReports={impactReports}
        setImpactReports={setImpactReports}
        navigation={navigation}
        visible={currentStep === 8}
      />
      <SocialMediaLinks
        socialMediaLinks={socialMediaLinks}
        setSocialMediaLinks={setSocialMediaLinks}
        navigation={navigation}
        visible={currentStep === 9}
      />
      <Preview
        name={name}
        ethereumAddress={ethereumAddress}
        missionStatement={missionStatement}
        proofOfOwnership={proofOfOwnership}
        profileImage={profileImage}
        headerImage={headerImage}
        additionalImages={additionalImages}
        impactReports={impactReports}
        socialMediaLinks={socialMediaLinks}
        navigation={navigation}
        visible={currentStep === 10}
      />
      <NavigationButtons navigation={navigation} />
      <Toaster />
    </div>
  );
}
