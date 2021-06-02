import React, { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

import { CheckIcon, DocumentAddIcon, XIcon } from '@heroicons/react/solid';
import { DocumentReportIcon } from '@heroicons/react/outline';
import toast, { Toaster } from 'react-hot-toast';

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

const FIVE_MB = 5 * 1000 * 1024;

function imageSizeValidator(file) {
  if (file.size > FIVE_MB) {
    uploadError('File size is greater than 5mb limit');
    return {
      code: 'file-too-large',
      message: `Size is larger than ${FIVE_MB} bytes`,
    };
  }
  return null;
}

const success = () => toast.success('Successful upload to IPFS');
const loading = () => toast.loading('Uploading to IPFS...');
const uploadError = (errMsg: string) => toast.error(errMsg);

export const uploadImageToPinata = (files, setProfileImage) => {
  var myHeaders = new Headers();
  myHeaders.append('pinata_api_key', process.env.PINATA_API_KEY);
  myHeaders.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
  files.forEach((file) => {
    var formdata = new FormData();
    formdata.append('file', file, 'download.png');
    loading();
    fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    })
      .then((response) => response.text())
      .then((result) => {
        const hash = JSON.parse(result).IpfsHash;
        setProfileImage(hash);
        toast.dismiss();
        success();
      })
      .catch((error) => {
        uploadError('Error uploading to IPFS');
      });
  });
};

export const uploadMultipleImagesToPinata = (
  files,
  currentLocalStorageVal,
  setLocalStorageVal,
) => {
  toast.dismiss();
  var myHeaders = new Headers();
  myHeaders.append('pinata_api_key', process.env.PINATA_API_KEY);
  myHeaders.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
  let newImageHashes = [];
  files.forEach((file) => {
    var formdata = new FormData();
    formdata.append('file', file, 'download.png');
    loading();
    fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    })
      .then((response) => response.text())
      .then((result) => {
        const hash = JSON.parse(result).IpfsHash;
        newImageHashes.push(hash);

        setLocalStorageVal(newImageHashes);
        toast.dismiss();
        success();
      })
      .catch((error) => {
        console.log({ error });
        uploadError('Error uploading to IPFS');
      });
  });
};

// TODO: Correct these
interface Props {
  localStorageFile: any;
  setLocalStorage: any;
  setCurrentStep: any;
  currentStep: any;
}

const DisplaySingleImage: React.FC<Props> = ({
  localStorageFile,
  setLocalStorage,
  setCurrentStep,
  currentStep,
}) => {
  return (
    <div className="grid justify-items-stretch">
      <p className="my-4 max-w-3xl mx-auto text-center text-xl text-gray-500 w-1/3 justify-self-center">
        Image Preview
      </p>
      <img
        className="w-1/4 justify-self-center"
        src={'https://gateway.pinata.cloud/ipfs/' + localStorageFile}
      ></img>
      <div className="row-auto my-2 justify-self-center">
        <button
          onClick={() => setLocalStorage(null)}
          className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cancel
          <XIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => setCurrentStep(currentStep++)}
          className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          OK
          <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const DisplayMultipleImages: React.FC<Props> = ({
  localStorageFile,
  setLocalStorage,
  setCurrentStep,
  currentStep,
}) => {
  return (
    <div className="grid justify-items-stretch">
      <p className="my-4 max-w-3xl mx-auto text-center text-xl text-gray-500 w-1/3 justify-self-center">
        Image Preview
      </p>
      <div className="my-4 grid grid-cols-4 gap-8 mx-16">
        {localStorageFile.map((imgHash) => {
          return (
            <div>
              <img src={'https://gateway.pinata.cloud/ipfs/' + imgHash}></img>
            </div>
          );
        })}
      </div>
      <div className="row-auto my-2 justify-self-center">
        <button
          onClick={() => setLocalStorage([])}
          className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cancel
          <XIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => setCurrentStep(currentStep++)}
          className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          OK
          <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const DisplayPDFs: React.FC<Props> = ({
  localStorageFile,
  setLocalStorage,
  setCurrentStep,
  currentStep,
}) => {
  return (
    <div className="grid justify-items-stretch">
      <p className="my-4 max-w-3xl mx-auto text-center text-xl text-gray-500 w-1/3 justify-self-center">
        {localStorageFile.length ? 'Document Preview' : ''}
      </p>
      <div>
        {localStorageFile.map((IpfsHash, i) => {
          return (
            <div className="row-auto justify-self-center">
              <a
                className="mx-2 justify-self-center mt-4 inline-flex px-4 py-1"
                href={'https://gateway.pinata.cloud/ipfs/' + IpfsHash}
              >
                {'Impact Report/Audit ' + i + ': '}
                <DocumentReportIcon className="ml-2 h-5 w-5" />
              </a>
            </div>
          );
        })}
      </div>
      <div className="row-auto my-2 justify-self-center">
        <button
          onClick={() => setLocalStorage([])}
          className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cancel
          <XIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => setCurrentStep(currentStep++)}
          className="mx-2 justify-self-center mt-4 inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          OK
          <CheckIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default function IpfsUpload({
  stepName,
  currentStep,
  setCurrentStep,
  localStorageFile,
  setLocalStorage,
  imageDescription,
  imageInstructions,
  fileType,
  numMaxFiles,
}) {
  const [files, setFiles] = useState([]);
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: fileType,
    maxFiles: numMaxFiles,
    validator: imageSizeValidator,
    onDrop: (acceptedFiles) => {
      if (numMaxFiles === 1) {
        uploadImageToPinata(acceptedFiles, setLocalStorage);
      } else {
        uploadMultipleImagesToPinata(
          acceptedFiles,
          localStorageFile,
          setLocalStorage,
        );
      }

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

  return (
    <div className="mx-auto content-center grid justify-items-stretch">
      <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
        {stepName}
      </h2>
      {!localStorageFile || localStorageFile.length === 0 ? (
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>
                      Upload
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop {imageDescription.toLowerCase()}</p>
                </div>
                <p className="text-xs text-gray-500">{imageInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {/* If numMaxFiles === 1, display component that contains just the one image otherwise display component that contains an album of files */}
      {localStorageFile && numMaxFiles === 1 && fileType === 'image/*' ? (
        <DisplaySingleImage
          localStorageFile={localStorageFile}
          setLocalStorage={setLocalStorage}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
        />
      ) : (
        <> </>
      )}
      {localStorageFile && numMaxFiles > 1 && fileType === 'image/*' ? (
        <DisplayMultipleImages
          localStorageFile={localStorageFile}
          setLocalStorage={setLocalStorage}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
        />
      ) : (
        <> </>
      )}
      {localStorageFile && numMaxFiles > 1 && fileType === '.pdf' ? (
        <DisplayPDFs
          localStorageFile={localStorageFile}
          setLocalStorage={setLocalStorage}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
        />
      ) : (
        <> </>
      )}
      <Toaster />
    </div>
  );
}
