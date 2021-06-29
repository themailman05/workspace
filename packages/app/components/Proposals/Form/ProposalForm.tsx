import React, { useEffect, useState } from 'react';
import NavBar from '../../NavBar/NavBar';
import Intro from './Intro';
import Name from './Name';
import BeneficiaryAddress from './BeneficiaryAddress';
import AdditionalImages from './AdditionalImages';
import HeaderImage from './HeaderImage';
import ImpactReportsAudits from './ImpactReportsAudits';
import MissionStatement from './MissionStatement';
import ProfileImage from './ProfileImage';
import ProofOfOwnership from './ProofOfOwnership';
import Preview from './Preview';
import NavigationButtons from './NavigationButtons';
import SocialMedia from './SocialMedia';
import { Toaster } from 'react-hot-toast';
import { BeneficiaryApplication } from '@popcorn/utils';

export interface Navigation {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepLimit: number;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

export interface FormStepProps {
  form: [
    BeneficiaryApplication,
    React.Dispatch<React.SetStateAction<BeneficiaryApplication>>,
  ];
  navigation: Navigation;
  visible: boolean;
}

export const defaultFormData: BeneficiaryApplication = {
  organizationName: '',
  missionStatement: '',
  beneficiaryAddress: '',
  files: {
    profileImage: '',
    headerImage: '',
    impactReports: [],
    additionalImages: [],
  },
  links: {
    twitterUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    githubUrl: '',
    proofOfOwnership: '',
  },
};

export default function PropsalForm(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLimit, setStepLimit] = useState<number>(1);
  const [formData, setFormData] =
    useState<BeneficiaryApplication>(defaultFormData);

  useEffect(() => {
    const formData = localStorage.getItem('beneficiaryNominationProposal');
    if (formData !== null) {
      setFormData(JSON.parse(formData));
    }
  }, []);

  const navigation: Navigation = {
    currentStep,
    setCurrentStep,
    stepLimit,
    setStepLimit,
  };

  useEffect(() => {
    //global validation, submission and saving to localstorage can be handled here
    localStorage.setItem(
      'beneficiaryNominationProposal',
      JSON.stringify(formData),
    );
  }, [formData]);
  return (
    <div className="flex flex-col h-screen justify-between">
      <NavBar />
      <Intro
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 0}
      />
      <Name
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 1}
      />
      <BeneficiaryAddress
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 2}
      />
      <MissionStatement
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 3}
      />
      <ProofOfOwnership
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 4}
      />
      <ProfileImage
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 5}
      />
      <HeaderImage
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 6}
      />
      <AdditionalImages
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 7}
      />
      <ImpactReportsAudits
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 8}
      />
      <SocialMedia
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 9}
      />
      <Preview
        form={[formData, setFormData]}
        navigation={navigation}
        visible={currentStep === 10}
      />
      <NavigationButtons navigation={navigation} />
      <Toaster />
    </div>
  );
}