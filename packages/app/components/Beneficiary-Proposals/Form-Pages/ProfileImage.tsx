import React, { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import useLocalStorageState from 'use-local-storage-state';
import { CheckIcon } from '@heroicons/react/solid';
import axios from 'axios';

// TODO: Save img to local storage
// TODO: Ability to edit image w/
// TODO: Ensure image has been uploaded to local storage
const thumbsContainer = {
  // display: 'flex',

  // flexWrap: 'wrap',
  // marginTop: 16,
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 200,
  height: 200,
  padding: 4,

};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%',
};

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};
const THREE_MB = 3 * 1000 * 1024;

function imageSizeValidator(file) {
  if (file.size > THREE_MB) {
    return {
      code: 'file-too-large',
      message: `Size is larger than ${THREE_MB} bytes`,
    };
  }

  return null;
}


export const testPinataUpload = (files, setProfileImage) => {
  var myHeaders = new Headers();
  myHeaders.append('pinata_api_key', '5234015f34353d28743c');
  myHeaders.append(
    'pinata_secret_api_key',
    'ddcb952d2b82ba252c98084536950663d84ab190b8f192ca5d843119676beaf2',
  );

  var formdata = new FormData();
  formdata.append('file', files[0], 'download.png');


  fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow',
  })
    .then((response) => response.text())
    .then((result) => {
      const hash = JSON.parse(result).IpfsHash;
      setProfileImage(hash)
      console.log({ result, hash })
    })
    .catch((error) => console.log('error', error));
};


export default function ProfileImage({ currentStep, setCurrentStep }) {
  const [files, setFiles] = useState([]);
  const [profileImage, setProfileImage] = useLocalStorageState<string>(
    'img',
    null,
  );
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: 'image/*',
    maxFiles: 1,
    validator: imageSizeValidator,
    onDrop: (acceptedFiles) => {
      testPinataUpload(acceptedFiles, setProfileImage);
      const file = acceptedFiles[0];
      setProfileImage(file);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept],
  );
  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
        <ul>
          {errors.map((e) => (
            <li key={e.code}>{e.message}</li>
          ))}
        </ul>
      </li>
    );
  });

  if (currentStep === 5) {
    return (
      <div className="mx-auto content-center justify-items-center">
        <p className="max-w-4xl text-xl text-black sm:text-2xl my-4">
          5 - Upload Profile Image
        </p>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Upload a square image, 150px x 150px and less than 3mb
        </label>
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
          <em>(1 files are the maximum number of files you can drop here)</em>
        </div>
        <aside>
          <h4>Accepted files</h4>
          <ul>{acceptedFileItems}</ul>
          <h4>Rejected files</h4>
          <ul>{fileRejectionItems}</ul>
        </aside>
        <div className="grid justify-items-stretch">
          <aside className="justify-self-center">
            {thumbs}
          </aside>
        </div>
        {acceptedFileItems.length ? (
          <div className="grid justify-items-stretch">
            <button
              onClick={() => setCurrentStep(currentStep++)}
              className=" justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              OK
              <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  } else {
    return <></>;
  }
}
