import Link from 'next/link';
import { useRouter } from 'next/router';
import NavbarLink from './NavbarLinks';

export default function Navbar(): JSX.Element {
  const router = useRouter();
  return (
    <nav
      className="flex shadow-md py-3 mb-8 px-14"
      style={{
        background: 'rgba(255, 255, 255, .5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div>
        <Link href="/" passHref>
          <a>
            <img
              src="/images/popcorn_v1_dark_bg.png"
              alt="Logo"
              className="w-8 h-8"
            ></img>
          </a>
        </Link>
      </div>
      <ul className="flex flex-row items-center mx-auto space-x-4">
        <li>
          <NavbarLink
            label="Grants"
            url="/grants"
            isActive={router.pathname === '/grants'}
          />
        </li>
        <li>
          <NavbarLink
            label="Staking"
            url="/lock-pop"
            isActive={router.pathname === '/lock-pop'}
          />
        </li>
      </ul>
    </nav>
  );
}
