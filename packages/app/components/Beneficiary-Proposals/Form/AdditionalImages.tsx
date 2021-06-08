import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormData, Navigation } from './ProposalForm';

interface Props {
  formData: FormData;
  navigation: Navigation;
  visible: boolean;
}

export default function AdditionalImages({
  formData,

  navigation,
  visible,
}: Props): JSX.Element {
  const { currentStep, setCurrentStep, setStepLimit } = navigation;
  const { additionalImages, setAdditionalImages } = formData;
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
