import getConfig from 'next/config';
import Link from 'next/link';

const Navigation = () => {
  const { publicRuntimeConfig } = getConfig();
  const navItems = [
    {
      pageId: 'home',
      href: publicRuntimeConfig.FIND_A_GRANT_URL,
      title: 'Home',
    },
    {
      pageId: 'manageUsers',
      href: '',
      title: 'Manage users',
    },
    {
      pageId: 'adminDash',
      href: '/dashboard',
      title: 'Admin dashboard',
    },
    {
      pageId: 'applicantDash',
      href: publicRuntimeConfig.APPLICANT_DOMAIN + '/dashboard',
      title: 'Applicant dashboard',
    },
    {
      pageId: 'technicalDash',
      href: publicRuntimeConfig.TECHNICAL_SUPPORT_DOMAIN + '/api-keys',
      title: 'Manage API Keys',
    },
  ];

  // Build the links in the main navigation && set active states
  return (
    <nav className="app-navigation govuk-clearfix g2_navigation govuk-width-container">
      <ul className="app-navigation__list app-width-container g2_navigation__menu gap_nav-wrapper">
        {navItems.map(({ href, title, pageId }, index) => {
          return (
            <li
              data-value="parent"
              key={index}
              className={`app-navigation__list-item ${
                pageId === 'manageUsers'
                  ? 'app-navigation__list-item--current'
                  : ''
              }`}
              id={`${pageId}DesktopLink`}
              data-cy={`cy${pageId}PageLink`}
            >
              <Link href={href}>
                <a
                  className="govuk-link govuk-link--no-visited-state app-navigation__link"
                  data-topnav={title}
                >
                  {title}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
