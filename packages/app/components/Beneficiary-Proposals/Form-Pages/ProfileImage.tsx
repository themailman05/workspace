import React from 'react';
import IpfsUpload from './IpfsUpload';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';

interface PIProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  profileImage: string;
  setProfileImage: UpdateState<string>;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

export default function ProfileImage({
  currentStep,
  setCurrentStep,
  profileImage,
  setProfileImage,
  setStepLimit,
}: PIProps) {
  if (currentStep === 5) {
    return (
      <IpfsUpload
        stepName={'5 - UPLOAD PROFILE IMAGE'}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        localStorageFile={profileImage}
        setLocalStorage={setProfileImage}
        imageDescription={'a Profile Image'}
        imageInstructions={
          'Upload a square image, ideally 150px x 150px and less than 5mb'
        }
        fileType={'image/*'}
        numMaxFiles={1}
        setStepLimit={setStepLimit}
      />
    );
  } else {
    return <></>;
  }
}
