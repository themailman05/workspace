import React from 'react';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import IpfsUpload from './IpfsUpload';
import { Navigation } from './PropsalForm';

interface IRProps {
  impactReports: string[];
  setImpactReports: UpdateState<string[]>;
  navigation: Navigation;
  visible: boolean;
}

export default function AdditionalImages({
  impactReports,
  setImpactReports,
  navigation,
  visible,
}: IRProps): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
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
