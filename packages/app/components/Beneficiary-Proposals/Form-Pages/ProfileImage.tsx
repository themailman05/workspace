import React from 'react';
import IpfsUpload from './IpfsUpload';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import { Navigation } from './PropsalForm';

interface PIProps {
  
  profileImage: string;
  setProfileImage: UpdateState<string>;
  navigation: Navigation;
  visible: boolean;
}

export default function ProfileImage({
  
  profileImage,
  setProfileImage,
  navigation,
  visible
}: PIProps) {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  if (visible) {
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
