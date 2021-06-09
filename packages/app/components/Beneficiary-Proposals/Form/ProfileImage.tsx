import React, { useEffect, useState } from 'react';
import IpfsUpload from './IpfsUpload';
import { Form, Navigation } from './ProposalForm';

interface PIProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export default function ProfileImage({
  form,
  setForm,
  navigation,
  visible,
}: PIProps) {
  function updateProfileImage(profileImage) {
    setForm({ ...form, profileImage });
  }
  if (visible) {
    return (
      <IpfsUpload
        stepName={'5 - UPLOAD PROFILE IMAGE'}
        localState={form.profileImage}
        setLocalState={updateProfileImage}
        imageDescription={'a Profile Image'}
        imageInstructions={
          'Upload a square image, ideally 150px x 150px and less than 5mb'
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
