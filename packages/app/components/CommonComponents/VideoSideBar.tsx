import { BeneficiaryApplication } from '@popcorn/utils';

export default function PhotoSideBar(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <div className="col-span-2 space-y-4">
      <p className="text-2xl text-black sm:text-4xl lg:text-5xl">Video</p>
      <video className="justify-self-center" controls>
        <source
          src={'https://gateway.pinata.cloud/ipfs/' + beneficiary?.files?.video}
          type="video/mp4"
        />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </div>
  );
}
