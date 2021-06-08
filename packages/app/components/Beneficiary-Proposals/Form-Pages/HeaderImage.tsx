import React from 'react';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import IpfsUpload from './IpfsUpload';
import { Navigation } from './PropsalForm';

interface HIProps {
  
  headerImage: string;
  setHeaderImage: UpdateState<string>;
  navigation: Navigation;
  visible: boolean;
}

export default function HeaderImage({
  
  headerImage,
  setHeaderImage,
  navigation,
  visible
}: HIProps): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  if (visible) {
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
