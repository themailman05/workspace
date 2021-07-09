import React from 'react';
import IpfsUpload from './IpfsUpload';
import { FormStepProps } from 'pages/proposals/propose';

export default function ImpactReportsAudits({
  form,
  navigation,
  visible,
}: FormStepProps): JSX.Element {
  const [formData, setFormData] = form;
  function updateImpactReports(impactReports) {
    setFormData({ ...formData, files: { ...formData.files, impactReports } });
  }
  return (
    visible && (
      <IpfsUpload
        stepName={'9 - Upload Impact Reports'}
        localState={formData.files.impactReports}
        setLocalState={updateImpactReports}
        fileDescription={'Impact Reports'}
        fileInstructions={
          `Impact report uploads are limited to up to a maximum of four PDFs,
          each with a maximum size of 5mb.`
        }
        fileType={'.pdf'}
        numMaxFiles={4}
        maxFileSizeMB={10}
        navigation={navigation}
      />
    )
  );
}
