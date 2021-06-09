import React, { useEffect, useState } from 'react';
import IpfsUpload from './IpfsUpload';
import { Form, Navigation } from './ProposalForm';

interface HIProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export default function HeaderImage({
  form,
  setForm,
  navigation,
  visible,
}: HIProps): JSX.Element {
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
