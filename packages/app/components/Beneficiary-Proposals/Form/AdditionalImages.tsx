import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormStepProps } from './ProposalForm';

export default function AdditionalImages({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  function updateAdditionalImages(additionalImages) {
    setForm({ ...form, additionalImages });
  }
  if (visible) {
    return (
      <IpfsUpload
        stepName={'7 - Upload Additional Images'}
        localState={form.additionalImages}
        setLocalState={updateAdditionalImages}
        imageDescription={'Additional Images'}
        imageInstructions={
          'The ideal image size and aspect ratio are 1200px X 675px and 16:9, respectively.'
        }
        fileType={'image/*'}
        numMaxFiles={4}
        navigation={navigation}
      />
    );
  } else {
    return <></>;
  }
}
