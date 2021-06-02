import React from 'react';
import IpfsUpload from './IpfsUpload';

export default function HeaderImage({ currentStep, setCurrentStep,headerImage, setHeaderImage }) {
  
  if (currentStep === 6) {
    return (
      <IpfsUpload
        stepName={'6 - UPLOAD HEADER IMAGE'}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        localStorageFile={headerImage}
        setLocalStorage={setHeaderImage}
        imageDescription={'a Header Image'}
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
