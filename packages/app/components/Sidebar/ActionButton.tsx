import { useRouter } from 'next/router';

interface ISidebarActionButton {
  hasLockedPop: boolean;
  isWalletConnected: boolean;
  connectWallet: () => void;
  submitVotes: () => void;
}

export default function SidebarActionButton({
  hasLockedPop,
  isWalletConnected,
  connectWallet,
  submitVotes,
}: ISidebarActionButton): JSX.Element {
  const router = useRouter();

  if (!isWalletConnected) {
    return (
      <button className="button button-primary w-full" onClick={connectWallet}>
        Connect Wallet
      </button>
    );
  }
  if (hasLockedPop) {
    return (
      <button className="button button-primary w-full" onClick={submitVotes}>
        Vote
      </button>
    );
  } else {
    return (
      <button
        className="button button-primary w-full"
        onClick={() => router.push('/staking')}
      >
        Lock POP
      </button>
    );
  }
}
