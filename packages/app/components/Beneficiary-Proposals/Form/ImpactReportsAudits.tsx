import React, { useEffect, useState } from 'react';
import IpfsUpload from './IpfsUpload';
import { Form, Navigation } from './ProposalForm';

interface IRProps {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  navigation: Navigation;
  visible: boolean;
}

export default function AdditionalImages({
  form,
  setForm,
  navigation,
  visible,
}: IRProps): JSX.Element {
  const [impactReports, setImpactReports] = useState<string[]>([]);
  // useEffect(() => {
  //   setImpactReports(form?.impactReports);
  // }, [form]);
  useEffect(() => {
    // handle input validation and updating parent form
    setForm({ ...form, impactReports });
  }, [impactReports]);
  if (visible) {
    return (
      <IpfsUpload
        stepName={'8 - Upload Impact Reports'}
        localState={impactReports}
        setLocalState={setImpactReports}
        imageDescription={'Impact Reports'}
        imageInstructions={
          'Impact report uploads are limited to up to a maximum of four PDFs, each with a maximum size of 5mb.'
        }
        fileType={'.pdf'}
        numMaxFiles={4}
        navigation={navigation}
      />
    );
  } else {
    return <></>;
  }
}
