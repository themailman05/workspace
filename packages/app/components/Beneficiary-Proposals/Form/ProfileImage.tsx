import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormData, Navigation } from './ProposalForm';

interface PIProps {
  formData: FormData;
  navigation: Navigation;
  visible: boolean;
}

export default function ProfileImage({
  formData,
  navigation,
  visible,
}: PIProps) {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const { profileImage, setProfileImage } = formData;
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
