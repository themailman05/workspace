interface DisplayFilesProps {
  localState: string | string[];
}

export const DisplayImage: React.FC<DisplayFilesProps> = ({ localState }) => {
  return (
    <div key={localState as string}>
      {localState?.length && (
        <img
          className="mx-auto w-1/2"
          src={'https://gateway.pinata.cloud/ipfs/' + localState}
        />
      )}
    </div>
  );
};

export const DisplayVideo: React.FC<DisplayFilesProps> = ({ localState }) => {
  return (
    localState !== '' && (
      <div className="grid justify-items-stretch">
        <p className="my-4 max-w-3xl mx-auto text-center text-xl text-gray-500 w-1/3 justify-self-center">
          Video Preview
        </p>
        <video className="w-1/4 justify-self-center" controls>
          <source
            src={'https://gateway.pinata.cloud/ipfs/' + localState}
            type="video/mp4"
          />
          Sorry, your browser doesn't support embedded videos.
        </video>
      </div>
    )
  );
};
