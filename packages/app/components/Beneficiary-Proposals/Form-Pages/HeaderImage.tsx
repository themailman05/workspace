import React from 'react';
import IpfsUpload from './IpfsUpload';
import useLocalStorageState from 'use-local-storage-state';

export default function HeaderImage({ currentStep, setCurrentStep }) {
  const [headerImage, setHeaderImage] = useLocalStorageState<string>(
    'headerimg',
    null,
  );
  if (currentStep === 6) {
    return (
      <IpfsUpload
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        localStorageFile={headerImage}
        setLocalStorage={setHeaderImage}
        imageDescription={'Header Image'}
        imageInstructions={
          'Ideal dimensions - 1500px x 500px and less than 5mb'
        }
        fileType={'image/*'}
        numMaxFiles={1}
      />
    );
  } else {
    return <></>;
  }
}
