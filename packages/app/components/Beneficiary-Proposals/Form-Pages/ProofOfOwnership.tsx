export default function ProofOfOwnership({ currentStep }):JSX.Element {
  if (currentStep === 4) {
    return (
      <div>
        <h1>PoO</h1>
      </div>
    );
  } else {
    return <></>;
  }
}