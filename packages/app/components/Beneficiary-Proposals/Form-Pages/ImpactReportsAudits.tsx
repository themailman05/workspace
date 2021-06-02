import React from 'react';
import IpfsUpload from './IpfsUpload';

export default function AdditionalImages({
  currentStep,
  setCurrentStep,
  impactReports,
  setImpactReports,
}) {
  if (currentStep === 8) {
    return (
      <IpfsUpload
        stepName={'8 - Upload Impact Reports'}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        localStorageFile={impactReports}
        setLocalStorage={setImpactReports}
        imageDescription={'Impact Reports'}
        imageInstructions={
          'Impact report uploads are limited to up to a maximum of four PDFs, each with a maximum size of 5mb.'
        }
        fileType={'.pdf'}
        numMaxFiles={4}
      />
    );
  } else {
    return <></>;
  }
}
