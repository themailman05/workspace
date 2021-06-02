
import React from 'react';
import IpfsUpload from './IpfsUpload';

export default function AdditionalImages({ currentStep, setCurrentStep,additionalImages, setAdditionalImages }) {
  
  if (currentStep === 7) {
    return (
      <IpfsUpload
        stepName={'7 - Upload Additional Images'}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        localStorageFile={additionalImages}
        setLocalStorage={setAdditionalImages}
        imageDescription={'Additional Images'}
        imageInstructions={
          'The ideal image size and aspect ratio are 1200px X 675px and 16:9, respectively.'
        }
        fileType={'image/*'}
        numMaxFiles={4}
      />
    );
  } else {
    return <></>;
  }
}
