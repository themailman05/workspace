import { FormStepProps } from 'pages/proposals/propose';
import React from 'react';
import inputExists from 'utils/isValidInput';
import ControlledTextInput from './ControlledTextInput';
import { DisplayImages } from './DisplayFiles';
import IpfsUpload from './IpfsUpload';
import ActionButtons from './IpfsUploadActionButtons';

export default function AdditionalImages({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;

  function updateAdditionalImages(additionalImages) {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        additionalImages: additionalImages.map((image) => {
          return { image: image, description: '' };
        }),
      },
    });
  }

  function updateImageDescription(description: string, index: number): void {
    formData.files.additionalImages[index].description = description;
  }

  function clearLocalState(): void {
    setFormData({
      ...formData,
      files: { ...formData.files, additionalImages: [] },
    });
  }

  function isFilled(): boolean {
    return (
      formData?.files?.additionalImages?.length > 0 &&
      formData?.files?.additionalImages.every(
        (image) => image.image !== '' && image.description !== '',
      )
    );
  }

  return (
    visible && (
      <>
        <IpfsUpload
          stepName={'7 - Upload Additional Images'}
          localState={formData?.files?.additionalImages?.map(
            (image) => image.image,
          )}
          setLocalState={updateAdditionalImages}
          imageDescription={'Additional Images'}
          imageInstructions={
            'The ideal image size and aspect ratio are 1200px X 675px and 16:9, respectively.'
          }
          fileType={'image/*'}
          numMaxFiles={4}
        />
        <DisplayImages
          localState={formData?.files?.additionalImages?.map(
            (image) => image.image,
          )}
        />
        <div className="mx-auto mt-4">
          {formData?.files?.additionalImages?.map((image, i) => (
            <ControlledTextInput
              inputValue={image.description}
              id={`description ${i}`}
              placeholder={`Description for Image ${i + 1}`}
              errorMessage="Image description cannot be blank."
              updateIndexedInput={updateImageDescription}
              isValid={inputExists}
            />
          ))}
          {isFilled() && (
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
