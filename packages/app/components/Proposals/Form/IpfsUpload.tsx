import * as axios from 'axios';
import ProgressBar from 'components/ProgressBar';
import { Navigation } from 'pages/proposals/propose';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Icon from 'react-feather';
import toast from 'react-hot-toast';
import { DisplayImages, DisplayPDFs, DisplayVideo } from './DisplayFiles';

const success = () => toast.success('Successful upload to IPFS');
const loading = () => toast.loading('Uploading to IPFS...');
const uploadError = (errMsg: string) => toast.error(errMsg);

export const uploadImageToPinata = (
  files: File[],
  setProfileImage:
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<string[]>>,
) => {
  var myHeaders = new Headers();
  myHeaders.append('pinata_api_key', process.env.PINATA_API_KEY);
  myHeaders.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
  files.forEach((file) => {
    var formdata = new FormData();
    formdata.append('file', file, 'download.png'); // TODO: Source from filename
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

export const uploadVideo = (
  files: File[],
  setVideo:
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<string[]>>,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
) => {
  files.forEach((file) => {
    var data = new FormData();
    data.append('file', file, 'download.png'); // TODO: Source video name from file
    loading();
    var config = {
      headers: {
        'Content-Type': `multipart/form-data;`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET,
      },
      onUploadProgress: (progressEvent) => {
        var percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setUploadProgress(percentCompleted);
      },
    };
    axios
      .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, config)
      .then((result) => {
        const hash = result.data.IpfsHash;
        setVideo(hash);
        toast.dismiss();
        success();
        setUploadProgress(0);
      })
      .catch((error) => {
        console.log(error);
        uploadError('Error uploading to IPFS');
      });
  });
};

function uploadMultipleImagesToPinata(
  files: File[],
  localState: string[], // TODO: Add type
  setLocalState, // TODO: Add type
) {
  toast.dismiss();
  var myHeaders = new Headers();
  myHeaders.append('pinata_api_key', process.env.PINATA_API_KEY);
  myHeaders.append('pinata_secret_api_key', process.env.PINATA_API_SECRET);
  let newImageHashes: string[] = [];
  files.forEach((file) => {
    var formdata = new FormData();
    formdata.append('file', file, 'download.png'); // TODO: Source from filenames
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
        setLocalState(newImageHashes);
        toast.dismiss();
        success();
      })
      .catch((error) => {
        uploadError('Error uploading to IPFS');
      });
  });
}

interface IpfsProps {
  stepName: string;
  localState: string | string[];
  setLocalState:
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<string[]>>;
  fileDescription: string;
  fileInstructions: string;
  fileType: string;
  numMaxFiles: number;
  maxFileSizeMB: number;
  navigation: Navigation;
}

const isValidFileSize = (file: File, maxFileSizeMB: number) => {
  const maxFileSizeBytes = maxFileSizeMB * 1000 * 1024;
  if (file.size > maxFileSizeBytes) {
    uploadError(`File size is greater than ${maxFileSizeMB}mb limit`);
    return {
      code: 'file-too-large',
      message: `File is larger than ${maxFileSizeMB} MB`,
    };
  }
  return null;
};

const videoUploading = (uploadProgress: number, fileType: string): boolean => {
  return uploadProgress > 0 && uploadProgress < 100 && fileType === 'video/*';
};

export default function IpfsUpload({
  stepName,
  localState,
  setLocalState,
  fileDescription,
  fileInstructions,
  fileType,
  numMaxFiles,
  maxFileSizeMB,
  navigation,
}: IpfsProps) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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
    validator: (file: File) => {
      return isValidFileSize(file, maxFileSizeMB);
    },
    onDrop: (acceptedFiles) => {
      if (fileRejections.length) {
        toast.error(`Maximum number of files to be uploaded is ${numMaxFiles}`);
      } else {
        if (numMaxFiles === 1 && fileType === 'image/*') {
          uploadImageToPinata(acceptedFiles, setLocalState);
        } else if (fileType === 'video/*') {
          uploadVideo(acceptedFiles, setLocalState, setUploadProgress);
        } else {
          uploadMultipleImagesToPinata(
            acceptedFiles,
            localState as string[],
            setLocalState,
          );
        }
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

  const rootProps = getRootProps() as any;
  return (
    <div className="mx-auto content-center grid justify-items-stretch">
      <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
        {stepName}
      </h2>
      {(!localState || localState.length === 0) &&
      !videoUploading(uploadProgress, fileType) ? (
        <div {...rootProps}>
          <input {...getInputProps()} />
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {fileType === 'image/*' ? (
                  <Icon.Image className="mx-auto h-12 w-12 text-gray-400" />
                ) : (
                  <Icon.FilePlus className="mx-auto h-12 w-12 text-gray-400" />
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
                    or drag and drop {fileDescription.toLowerCase()}
                  </p>
                </div>
                <p className="text-xs text-gray-500">{fileInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {videoUploading(uploadProgress, fileType) && (
        <div className="grid my-2 justify-items-stretch">
          <span className="mx-4  w-1/2 justify-self-center flex flex-row justify-between  pb-2">
            <ProgressBar
              progress={uploadProgress}
              progressColor={'bg-green-300'}
            />
          </span>
        </div>
      )}
      {localState && fileType === 'video/*' ? (
        <DisplayVideo
          localState={localState}
          setLocalState={setLocalState}
          navigation={navigation}
        />
      ) : (
        <> </>
      )}
      {numMaxFiles === 1 && localState && fileType === 'image/*' ? (
        <DisplayImages
          localState={localState}
          setLocalState={setLocalState}
          navigation={navigation}
        />
      ) : (
        <> </>
      )}

      {numMaxFiles > 1 && localState.length > 0 && fileType === 'image/*' ? (
        <DisplayImages
          localState={localState}
          setLocalState={setLocalState}
          navigation={navigation}
        />
      ) : (
        <> </>
      )}
      {numMaxFiles > 1 && localState.length > 0 && fileType === '.pdf' ? (
        <DisplayPDFs
          localState={localState}
          setLocalState={setLocalState}
          navigation={navigation}
        />
      ) : (
        <> </>
      )}
    </div>
  );
}
