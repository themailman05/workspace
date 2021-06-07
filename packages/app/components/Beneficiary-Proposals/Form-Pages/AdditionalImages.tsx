import React from 'react';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import IpfsUpload from './IpfsUpload';

interface Props {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  additionalImages: string[];
  setAdditionalImages: UpdateState<string[]>;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
  visible: boolean;
}

export default function AdditionalImages({
  currentStep,
  setCurrentStep,
  additionalImages,
  setAdditionalImages,
  setStepLimit,
  visible
}: Props): JSX.Element {
  if (visible) {
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
        setStepLimit={setStepLimit}
      />
    );
  } else {
    return <></>;
  }
}
