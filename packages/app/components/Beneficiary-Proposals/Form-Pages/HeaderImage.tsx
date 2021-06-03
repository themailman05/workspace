import React from 'react';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import IpfsUpload from './IpfsUpload';

interface HIProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  headerImage: string;
  setHeaderImage: UpdateState<string>;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

export default function HeaderImage({
  currentStep,
  setCurrentStep,
  headerImage,
  setHeaderImage,
  setStepLimit,
}: HIProps): JSX.Element {
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
        setStepLimit={setStepLimit}
      />
    );
  } else {
    return <></>;
  }
}
