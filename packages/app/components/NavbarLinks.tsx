import Link from 'next/link';

interface NavbarLinkProps {
  label: string;
  url: string;
  isActive: boolean;
}

export default function NavbarLink({
  label,
  url,
  isActive,
}: NavbarLinkProps): JSX.Element {
  return (
    <li>
      <Link href={url} passHref>
        <a
          className={`font-medium text-lg ${
            isActive ? 'text-primary font-medium' : 'text-gray-700'
          } hover:text-primaryLight`}
        >
          {label}
        </a>
      </Link>
    </li>
  );
}
