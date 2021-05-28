export default function EtherumAddress({ currentStep, ethereumAddress, setEthereumAddress }): JSX.Element {
  if (currentStep === 2) {
    return (
      <div>
        <h1>Eth Address</h1>
      </div>
    );
  } else {
    return <></>;
  }
}
