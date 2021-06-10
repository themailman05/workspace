import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormStepProps } from './ProposalForm';

export default function ProfileImage({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps) {
  function updateProfileImage(profileImage) {
    setForm({ ...form, profileImage });
  }
  return (
    visible && (
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
    )
  );
}
