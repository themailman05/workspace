import IpfsUpload from './IpfsUpload';
import { FormStepProps } from 'pages/proposals/propose';
import { DisplayImages, DisplayPDFs } from './DisplayFiles';
import ActionButtons from './IpfsUploadActionButtons';
import ControlledTextInput from './ControlledTextInput';
import inputExists from 'utils/isValidInput';

export default function HeaderImage({
  form,
  navigation,
  visible,
}: FormStepProps) {
  const [formData, setFormData] = form;

  function updateImpactReports(impactReports: string[]): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        impactReports: impactReports,
      },
    });
  }

  function clearLocalState(): void {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        impactReports: [],
      },
    });
  }

  return (
    visible && (
      <>
        <IpfsUpload
          stepName={'8 - Upload Impact Reports'}
          localState={formData?.files?.impactReports}
          setLocalStateMultiple={updateImpactReports}
          imageDescription={'Impact Reports'}
          imageInstructions={
            'Impact report uploads are limited to up to a maximum of four PDFs, each with a maximum size of 5mb.'
          }
          fileType={'.pdf'}
          numMaxFiles={4}
        />
        <DisplayPDFs localState={formData?.files?.impactReports} />
        <ActionButtons
          clearLocalState={clearLocalState}
          navigation={navigation}
        />
      </>
    )
  );
}
