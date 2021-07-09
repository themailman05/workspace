import { FormStepProps } from 'pages/proposals/propose';
import { DisplayPDFs } from './DisplayFiles';
import IpfsUpload from './IpfsUpload';
import ActionButtons from './IpfsUploadActionButtons';

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
          setLocalState={updateImpactReports}
          imageDescription={'Impact Reports'}
          imageInstructions={
            'Impact report uploads are limited to up to a maximum of four PDFs, each with a maximum size of 5mb.'
          }
          fileType={'.pdf'}
          numMaxFiles={4}
        />
        <div className="mx-auto">
          <DisplayPDFs localState={formData?.files?.impactReports} />
          {formData?.files?.impactReports?.length > 0 && (
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
