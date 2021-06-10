import web3 from 'web3';
import { FormStepProps } from './ProposalForm';
import ControlledTextInput from './ControlledTextInput';

export default function EtherumAddress({
  form,
  setForm,
  navigation,
  visible,
}: FormStepProps): JSX.Element {

  function updateEthereumAddress(value: string): void {
    setForm({ ...form, ethereumAddress: value });
  }

  return (
    visible && (
      <div className="mx-auto content-center justify-items-center">
        <h2 className="justify-self-center text-base text-indigo-600 font-semibold tracking-wide uppercase">
          2 - What's the Ethereum address grants will be sent to?
        </h2>
        <ControlledTextInput
          inputValue={form.ethereumAddress}
          id="ethereumAddress"
          placeholder="Ethererum Address"
          errorMessage="Please enter a valid ethereum address"
          updateInput={updateEthereumAddress}
          isValid={web3.utils.isAddress}
          navigation={navigation}
        />
      </div>
    )
  );
}
