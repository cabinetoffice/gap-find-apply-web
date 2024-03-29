import getConfig from 'next/config';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navigation = ({ isSuperAdminNav = true }) => {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const navItems = isSuperAdminNav
    ? [
        {
          pageId: 'home',
          href: publicRuntimeConfig.FIND_A_GRANT_URL,
          title: 'Home',
        },
        {
          pageId: 'manageUsers',
          href: publicRuntimeConfig.SUPER_ADMIN_DASHBOARD_URL,
          title: 'Manage users',
          routerPathname: '/super-admin-dashboard',
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
          href:
            publicRuntimeConfig.TECHNICAL_SUPPORT_DOMAIN + '/api-keys/manage',
          title: 'Manage API keys',
        },
        {
          pageId: 'integrations',
          href: `${publicRuntimeConfig.SUPER_ADMIN_DASHBOARD_URL}/integrations`,
          title: 'Integrations',
          routerPathname: '/super-admin-dashboard/integrations',
        },
      ]
    : [
        {
          pageId: 'apiKeys',
          href: publicRuntimeConfig.TECHNICAL_SUPPORT_DOMAIN + '/api-keys',
          title: 'Manage API keys',
        },
      ];

  // Build the links in the main navigation && set active states
  return (
    <nav className="app-navigation govuk-clearfix g2_navigation govuk-width-container super-admin-navbar">
      <ul className="app-navigation__list app-width-container g2_navigation__menu gap_nav-wrapper">
        {navItems.map(
          (
            {
              href,
              title,
              pageId,
              routerPathname,
            }: {
              href: string;
              title: string;
              pageId: string;
              routerPathname?: string;
            },
            index
          ) => (
            <li
              data-value="parent"
              key={index}
              className={`app-navigation__list-item ${
                routerPathname === router.pathname
                  ? 'app-navigation__list-item--current'
                  : ''
              }`}
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
          )
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
