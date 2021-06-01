import React from 'react';
import IpfsUpload from './IpfsUpload';
import useLocalStorageState from 'use-local-storage-state';

export default function ProfileImage({ currentStep, setCurrentStep }) {
  const [profileImage, setProfileImage] = useLocalStorageState<string>(
    'img',
    null,
  );
  if (currentStep === 5) {
    return (
      <IpfsUpload
        stepName={"5 - UPLOAD PROFILE IMAGE"}
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
