import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BeneficiaryApplication } from '@popcorn/utils';
import MissionStatement from 'components/Proposals/Form/MissionStatement';
import SocialMedia from 'components/Proposals/Form/SocialMedia';
import NavBar from 'components/NavBar/NavBar';
import AdditionalImages from 'components/Proposals/Form/AdditionalImages';
import BeneficiaryAddress from 'components/Proposals/Form/BeneficiaryAddress';
import HeaderImage from 'components/Proposals/Form/HeaderImage';
import ImpactReportsAudits from 'components/Proposals/Form/ImpactReportsAudits';
import Intro from 'components/Proposals/Form/Intro';
import Name from 'components/Proposals/Form/Name';
import NavigationButtons from 'components/Proposals/Form/NavigationButtons';
import Preview from 'components/Proposals/Form/Preview';
import ProfileImage from 'components/Proposals/Form/ProfileImage';
import ProofOfOwnership from 'components/Proposals/Form/ProofOfOwnership';
import { useRouter } from 'next/router';

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

export default function BeneficiaryProposal(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLimit, setStepLimit] = useState<number>(1);
  const [formData, setFormData] =
    useState<BeneficiaryApplication>(defaultFormData);
  const router = useRouter();
  useEffect(() => {
    const formData = localStorage.getItem('beneficiaryNominationProposal');
    if (formData !== null) {
      setFormData(JSON.parse(formData));
    }
  }, []);

  useEffect(() => {
    const step = Number(router.query.step as string);
    if (step && step !== currentStep && step < stepLimit) setCurrentStep(step);
    if (step && step !== currentStep && step >= stepLimit)
      setCurrentStep(stepLimit - 1);
  }, [router]);

  useEffect(() => {
    router.push(`/proposals/propose/?step=${currentStep}`, undefined, {
      shallow: true,
    });
  }, [currentStep]);

  useEffect(() => {
    //global validation, submission and saving to localstorage can be handled here
    localStorage.setItem(
      'beneficiaryNominationProposal',
      JSON.stringify(formData),
    );
  }, [formData]);

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
