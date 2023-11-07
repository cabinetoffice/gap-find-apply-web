import Link from 'next/link';
import { LinkContent, links } from '.';
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
      <Link href={btn.as} as={btn.link}>
        <a data-topnav={btn.title}>{btn.title}</a>
      </Link>
    </li>
  );
};

const MobileNavigationBar = () => (
  <details className="menu-toggler-mobile govuk-body">
    <summary
      data-cy="cyMobileMenuBtn"
      role="button"
      aria-label="Show or hide menu"
    >
      Menu
    </summary>
    <nav aria-label="menu">
      <ul>
        {links.map((btn, index) => (
          <GovLinkMobile key={index} btn={btn} index={index} />
        ))}
      </ul>
    </nav>
  </details>
);

export { MobileNavigationBar };
