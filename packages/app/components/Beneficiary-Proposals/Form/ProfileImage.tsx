import React from 'react';
import IpfsUpload from './IpfsUpload';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import { FormData, Navigation } from './ProposalForm';

interface PIProps {
  formData: FormData;
  setProfileImage: UpdateState<string>;
  navigation: Navigation;
  visible: boolean;
}

export default function ProfileImage({
  formData,
  setProfileImage,
  navigation,
  visible,
}: PIProps) {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const { profileImage } = formData;
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
