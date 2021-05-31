export default function HeaderImage({ currentStep }):JSX.Element {
  if (currentStep === 6) {
    return (
      <div>
        <h1>Header Image</h1>
      </div>
    );
  } else {
    return <></>;
  }
}