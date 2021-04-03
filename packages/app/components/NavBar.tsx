import Link from 'next/link';

export default function NavBar(): JSX.Element {
  return (
    <nav className="w-full h-10 bg-white mb-8">
      <ul className="flex flex-row items-center">
        <li>
          <Link href="/grants" passHref>
            <a>Grant Elections</a>
          </Link>
        </li>
        <li>
          <Link href="/staking" passHref>
            <a>POP Staking</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
