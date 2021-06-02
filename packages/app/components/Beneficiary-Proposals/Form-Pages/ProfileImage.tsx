import React from 'react';
import IpfsUpload from './IpfsUpload';

export default function ProfileImage({
  currentStep,
  setCurrentStep,
  profileImage,
  setProfileImage,
}) {
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
      />
    );
  } else {
    return <></>;
  }
}
