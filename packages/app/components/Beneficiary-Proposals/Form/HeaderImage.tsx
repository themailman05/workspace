import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormStepProps } from './ProposalForm';

export default function HeaderImage({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  function updateHeaderImage(headerImage) {
    setForm({ ...form, headerImage });
  }
  if (visible) {
    return (
      <IpfsUpload
        stepName={'6 - UPLOAD HEADER IMAGE'}
        localState={form.headerImage}
        setLocalState={updateHeaderImage}
        imageDescription={'a Header Image'}
        imageInstructions={
          'Ideal dimensions - 1500px x 500px and less than 5mb'
        }
        fileType={'image/*'}
        numMaxFiles={1}
        navigation={navigation}
      />
    );
  } else {
    return <></>;
  }
}
