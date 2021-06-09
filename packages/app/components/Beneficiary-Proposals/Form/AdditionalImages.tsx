import React, { useEffect, useState } from 'react';
import IpfsUpload from './IpfsUpload';
import { Form, Navigation } from './ProposalForm';

interface Props {
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
}: Props): JSX.Element {
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  
  // useEffect(() => {
  //   setAdditionalImages(form?.additionalImages);
  // }, [form]);

  useEffect(() => {
    // handle input validation and updating parent form
    setForm({ ...form, additionalImages });
  }, [additionalImages]);

  if (visible) {
    return (
      <IpfsUpload
        stepName={'7 - Upload Additional Images'}
        localState={additionalImages}
        setLocalState={setAdditionalImages}
        imageDescription={'Additional Images'}
        imageInstructions={
          'The ideal image size and aspect ratio are 1200px X 675px and 16:9, respectively.'
        }
        fileType={'image/*'}
        numMaxFiles={4}
        navigation={navigation}
      />
    );
  } else {
    return <></>;
  }
}
