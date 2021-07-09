import { FormStepProps } from 'pages/proposals/propose';
import React from 'react';
import IpfsUpload from './IpfsUpload';

export default function ProfileImage({
  form,
  navigation,
  visible,
}: FormStepProps) {
  const [formData, setFormData] = form;
  function updateVideo(video) {
    setFormData({ ...formData, files: { ...formData.files, video } });
  }
  const maxVideoSizeMB = 30;
  return (
    visible && (
      <IpfsUpload
        stepName={'8 - UPLOAD VIDEO'}
        localState={formData.files.video}
        setLocalState={updateVideo}
        fileDescription={'a Video'}
        fileInstructions={`Upload a video less than ${maxVideoSizeMB}mb`}
        fileType={'video/*'}
        numMaxFiles={1}
        maxFileSizeMB={maxVideoSizeMB}
        navigation={navigation}
      />
    )
  );
}
