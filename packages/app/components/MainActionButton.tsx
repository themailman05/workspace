interface MainActionButtonProps {
  label: string;
  handleClick: any;
  disabled?: boolean;
}

export default function MainActionButton({
  label,
  handleClick,
  disabled = false,
}: MainActionButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl leading-6 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
