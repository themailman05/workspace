import { FormStepProps } from 'pages/proposals/propose';
import React from 'react';
import inputExists from 'utils/isValidInput';
import ControlledTextInput from './ControlledTextInput';
import { DisplayImages } from './DisplayFiles';
import IpfsUpload from './IpfsUpload';
import ActionButtons from './IpfsUploadActionButtons';

export default function ProfileImage({
  form,
  navigation,
  visible,
}: FormStepProps) {
  const [formData, setFormData] = form;

  function updateProfileImage(profileImage: string): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        profileImage: {
          image: profileImage,
          description: formData?.files?.profileImage?.description,
        },
      },
    });
  }

  function updateProfilImageDescription(description: string): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        profileImage: {
          image: formData?.files?.profileImage?.image,
          description: description,
        },
      },
    });
  }

  function clearLocalState(): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        profileImage: {
          image: '',
          description: formData?.files?.profileImage?.description,
        },
      },
    });
  }

  return (
    visible && (
      <>
        <IpfsUpload
          stepName={'5 - UPLOAD PROFILE IMAGE'}
          localState={formData?.files?.profileImage?.image}
          setLocalState={updateProfileImage}
          imageDescription={'a Profile Image'}
          imageInstructions={
            'Upload a square image, ideally 150px x 150px and less than 5mb'
          }
          fileType={'image/*'}
          numMaxFiles={1}
        />
        <DisplayImages localState={formData?.files?.profileImage?.image} />
        <div className="mx-auto mt-4">
          <ControlledTextInput
            inputValue={formData?.files?.profileImage?.description}
            id="profilImageDescription"
            placeholder="Image Description"
            errorMessage="Image Description cannot be blank."
            updateInput={updateProfilImageDescription}
            isValid={inputExists}
          />
          {formData?.files?.profileImage?.image !== '' &&
            formData?.files?.profileImage?.description !== '' && (
              <ActionButtons
                clearLocalState={clearLocalState}
                navigation={navigation}
              />
            )}
        </div>
      </>
    )
  );
}
