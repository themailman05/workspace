import React from 'react';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import IpfsUpload from './IpfsUpload';
import { Navigation } from './PropsalForm';

interface Props {
  additionalImages: string[];
  setAdditionalImages: UpdateState<string[]>;
  navigation: Navigation;
  visible: boolean;
}

export default function AdditionalImages({
  additionalImages,
  setAdditionalImages,
  navigation,
  visible,
}: Props): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
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
