import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormStepProps } from 'pages/proposals/propose';

export default function ProfileImage({
  form,
  navigation,
  visible,
}: FormStepProps) {
  const [formData, setFormData] = form;
  function updateVideo(video) {
    setFormData({ ...formData, files: { ...formData.files, video } });
  }
  return (
    visible && (
      <IpfsUpload
        stepName={'5 - UPLOAD VIDEO'}
        localState={formData.files.video}
        setLocalState={updateVideo}
        fileDescription={'a Video'}
        fileInstructions={
          'Upload a video less than 30mb and less than 3 minutes'
        }
        fileType={'video/*'}
        numMaxFiles={1}
        maxFileSizeMB={30}
        navigation={navigation}
      />
    )
  );
}
