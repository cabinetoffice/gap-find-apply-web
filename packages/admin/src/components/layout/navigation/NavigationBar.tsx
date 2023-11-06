import Link from 'next/link';
import { useRouter } from 'next/router';
import { links } from '.';

const NavigationBar = () => {
  return (
    <nav className="app-navigation govuk-clearfix g2_navigation govuk-width-container">
      <ul className="app-navigation__list app-width-container g2_navigation__menu gap_nav-wrapper">
        {links.map((btn: LinkContent, index: number) => (
          <GovLink key={index} btn={btn} index={index} />
        ))}
      </ul>
    </nav>
  );
};

const GovLink = ({ btn, index }: { index: number; btn: LinkContent }) => {
  const router = useRouter();
  return (
    <li
      data-value="parent"
      key={index}
      className={`app-navigation__list-item ${
        router.pathname === btn.link ? 'app-navigation__list-item--current' : ''
      }`}
      id={`${btn.pageId}DesktopLink`}
      data-cy={`cy${btn.pageId}PageLink`}
    >
      <Link href={btn.as} as={btn.link}>
        <a
          className="govuk-link govuk-link--no-visited-state app-navigation__link"
          data-topnav={btn.title}
        >
          {btn.title}
        </a>
      </Link>
    </li>
  );
};

type LinkContent = {
  title: string;
  link: string;
  as: string;
  pageId: string;
};

export { NavigationBar, type LinkContent };
