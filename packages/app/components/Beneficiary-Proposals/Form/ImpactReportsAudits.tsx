import React from 'react';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import IpfsUpload from './IpfsUpload';
import { FormData, Navigation } from './ProposalForm';

interface IRProps {
  formData: FormData;
  setImpactReports: UpdateState<string[]>;
  navigation: Navigation;
  visible: boolean;
}

export default function AdditionalImages({
  formData,
  setImpactReports,
  navigation,
  visible,
}: IRProps): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const { impactReports } = formData;
  if (visible) {
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
        setStepLimit={setStepLimit}
      />
    );
  } else {
    return <></>;
  }
}
