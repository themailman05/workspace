import Link from 'next/link';


interface NavbarLinkProps {
  label: string;
  url?: string;
  isActive: boolean;
  onClick?: Function;
}


export default function NavbarLink({
  label,
  url,
  isActive,
  onClick,
}: NavbarLinkProps): JSX.Element {

  const className = `
    font-medium 
    text-lg ${isActive ? 'text-primary font-medium' : 'text-gray-700'} 
    hover:text-primaryLight cursor-pointer
  `;

  return (
    <li>
      <Link href={url || ''} passHref>
        <a
          className={className}
          onClick={(e) => {  onClick && onClick(); }}
        >
          {label}
        </a>
      </Link>
    </li>);
}
