import getConfig from 'next/config';
import Link from 'next/link';

const Navigation = () => {
  const { publicRuntimeConfig } = getConfig();
  const navItems = [
    {
      pageId: 'apiKeys',
      href: publicRuntimeConfig.TECHNICAL_SUPPORT_DOMAIN + '/api-keys',
      title: 'Manage API keys',
    },
  ];

  return (
    <nav className="app-navigation govuk-clearfix g2_navigation govuk-width-container super-admin-navbar">
      <ul className="app-navigation__list app-width-container g2_navigation__menu gap_nav-wrapper">
        {navItems.map(({ href, title, pageId }, index) => (
          <li
            data-value="parent"
            key={index}
            className={`app-navigation__list-item`}
            id={`${pageId}DesktopLink`}
            data-cy={`cy${pageId}PageLink`}
          >
            <Link
              href={href}
              as={href}
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              data-topnav={title}
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
