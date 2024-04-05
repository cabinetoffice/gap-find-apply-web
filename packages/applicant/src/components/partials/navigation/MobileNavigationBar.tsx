import Link from 'next/link';
import { LinkContent, authMobileLinks, links } from '.';
import { useRouter } from 'next/router';

const GovLinkMobile = ({ btn, index }: { btn: LinkContent; index: number }) => {
  const router = useRouter();
  return (
    <li
      data-value="parent"
      key={index}
      className={`mobile_nav_link ${
        router.pathname === btn.link ? 'current' : ''
      }`}
      id={`${btn.pageId}MobileLink`}
      data-cy={`cy${btn.pageId}PageMobileLink`}
    >
      <Link href={btn.as} as={btn.link} data-topnav={btn.title}>
        {btn.title}
      </Link>
    </li>
  );
};

const MobileNavigationBar = (isSuperAdmin) => (
  <details className="menu-toggler-mobile govuk-body">
    <summary
      data-cy="cyMobileMenuBtn"
      role="button"
      aria-label="Show or hide menu"
    >
      Menu
    </summary>
    <nav aria-label="menu">
      {isSuperAdmin ? (
        <ul>
          {authMobileLinks.map((btn, index) => (
            <GovLinkMobile key={index} btn={btn} index={index} />
          ))}
        </ul>
      ) : (
        <ul>
          {links.map((btn, index) => (
            <GovLinkMobile key={index} btn={btn} index={index} />
          ))}
        </ul>
      )}
    </nav>
  </details>
);

export { MobileNavigationBar };
