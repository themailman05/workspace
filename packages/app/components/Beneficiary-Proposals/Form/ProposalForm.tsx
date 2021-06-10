import React, { useEffect, useState } from 'react';
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
import { Toaster } from 'react-hot-toast';

export interface Navigation {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepLimit: number;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

export interface FormStepProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export interface Form {
  additionalImages: string[];
  ethereumAddress: string;
  headerImage: string;
  impactReports: string[];
  missionStatement: string;
  name: string;
  profileImage: string;
  proofOfOwnership: string;
  twitterUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  githubUrl: string;
}

export default function PropsalForm(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLimit, setStepLimit] = useState<number>(1);
  const [form, setForm] = useState<Form>({
    additionalImages: [],
    ethereumAddress: '',
    headerImage: '',
    impactReports: [],
    missionStatement: '',
    name: '',
    profileImage: '',
    proofOfOwnership: '',
    twitterUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    githubUrl: '',
  });

  useEffect(() => {
    const formData = localStorage.getItem('beneficiaryNominationProposal');
    if (formData !== null) {
      setForm(JSON.parse(formData));
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
    localStorage.setItem('beneficiaryNominationProposal', JSON.stringify(form));
  }, [form]);

  return (
    <div className="flex flex-col h-screen justify-between">
      <NavBar />
      <Intro
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 0}
      />
      <Name
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 1}
      />
      <EthereumAddress
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 2}
      />
      <MissionStatement
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 3}
      />
      <ProofOfOwnership
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 4}
      />
      <ProfileImage
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 5}
      />
      <HeaderImage
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 6}
      />
      <AdditionalImages
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 7}
      />
      <ImpactReportsAudits
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 8}
      />
      <SocialMedia
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 9}
      />
      <Preview
        form={form}
        setForm={setForm}
        navigation={navigation}
        visible={currentStep === 10}
      />
      <NavigationButtons navigation={navigation} />
      <Toaster />
    </div>
  );
}
