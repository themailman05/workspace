import React, { useState, useMemo } from 'react';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { UpdateState } from 'use-local-storage-state/src/useLocalStorageStateBase';
import { DisplayImages, DisplayPDFs } from './DisplayFiles';
import { DocumentAddIcon, PhotographIcon } from '@heroicons/react/solid';

const baseStyle = {
  flex: 1,
  display: 'flex',
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

function uploadMultipleImagesToPinata(
  files,
  currentLocalStorageVal,
  setLocalStorageVal,
) {
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
}

interface IpfsProps {
  stepName: string;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  localStorageFile: string | string[];
  setLocalStorage: UpdateState<string> | UpdateState<string[]>;
  imageDescription: string;
  imageInstructions: string;
  fileType: string;
  numMaxFiles: number;
  setStepLimit: React.Dispatch<React.SetStateAction<number>>;
}

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
  setStepLimit,
}: IpfsProps) {
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
  // Hack to avoid netlify build breaking.
  const rootProps = getRootProps({ style }) as any;
  return (
    <div className="mx-auto content-center grid justify-items-stretch">
      <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
        {stepName}
      </h2>
      {!localStorageFile || localStorageFile.length === 0 ? (
        <div {...rootProps}>
          <input {...getInputProps()} />
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {fileType === 'image/*' ? (
                  <PhotographIcon className="mx-auto h-12 w-12 text-gray-400" />
                ) : (
                  <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">
                    or drag and drop {imageDescription.toLowerCase()}
                  </p>
                </div>
                <p className="text-xs text-gray-500">{imageInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {numMaxFiles === 1 && localStorageFile && fileType === 'image/*' ? (
        <DisplayImages
          localStorageFile={localStorageFile}
          setLocalStorage={setLocalStorage}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          setStepLimit={setStepLimit}
        />
      ) : (
        <> </>
      )}
      {numMaxFiles > 1 &&
      localStorageFile.length > 0 &&
      fileType === 'image/*' ? (
        <DisplayImages
          localStorageFile={localStorageFile}
          setLocalStorage={setLocalStorage}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          setStepLimit={setStepLimit}
        />
      ) : (
        <> </>
      )}
      {numMaxFiles > 1 && localStorageFile.length > 0 && fileType === '.pdf' ? (
        <DisplayPDFs
          localStorageFile={localStorageFile}
          setLocalStorage={setLocalStorage}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          setStepLimit={setStepLimit}
        />
      ) : (
        <> </>
      )}
    </div>
  );
}
