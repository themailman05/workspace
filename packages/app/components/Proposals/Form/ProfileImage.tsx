import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormStepProps } from 'pages/proposals/propose';

export default function ProfileImage({
  form,
  navigation,
  visible,
}: FormStepProps) {
  const [formData, setFormData] = form;
  function updateProfileImage(profileImage) {
    setFormData({ ...formData, files: { ...formData.files, profileImage } });
  }
  return (
    visible && (
      <IpfsUpload
        stepName={'5 - UPLOAD PROFILE IMAGE'}
        localState={formData.files.profileImage}
        setLocalState={updateProfileImage}
        fileDescription={'a Profile Image'}
        fileInstructions={
          'Upload a square image, ideally 150px x 150px and less than 5mb'
        }
        fileType={'image/*'}
        numMaxFiles={1}
        maxFileSizeMB={5}
        navigation={navigation}
      />
    )
  );
}
