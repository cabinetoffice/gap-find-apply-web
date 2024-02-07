import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import getConfig from 'next/config';
import { SummaryList } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../utils/session';
import {
  getUserById,
  getUserFromJwt,
} from '../../../../services/SuperAdminService';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { fetchDataOrGetRedirect } from '../../../../utils/fetchDataOrGetRedirect';
import moment from 'moment';
import InferProps from '../../../../types/InferProps';
import { getAdminsSchemes } from '../../../../services/SchemeService';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { id: userId } = params! as { id: string };
  const userToken = getUserTokenFromCookies(req);
  const sessionId = getSessionIdFromCookies(req);

  const getPageData = async () => {
    const jwtUser = await getUserFromJwt(userToken);
    const isViewingOwnAccount = jwtUser?.gapUserId === userId;
    const user = isViewingOwnAccount
      ? jwtUser
      : await getUserById(userId, userToken);

    const sub = user?.sub ? user.sub : user.colaSub;
    const usersSchemes = await getAdminsSchemes(sub, sessionId);
    const adminRoles = new Set(['ADMIN', 'SUPER_ADMIN']);
    const isUserAdmin = user.role && adminRoles.has(user.role?.name);

    return {
      isViewingOwnAccount,
      ...user,
      schemes: usersSchemes,
      isUserAdmin,
    };
  };

  return await fetchDataOrGetRedirect(getPageData);
};

const DeleteButton = ({
  children,
  userHasSchemes,
  gapUserId,
}: {
  children: JSX.Element | string;
  userHasSchemes: boolean;
  gapUserId: string;
}) =>
  !userHasSchemes ? (
    <CustomLink
      href={`/super-admin-dashboard/user/${gapUserId}/delete-user`}
      customStyle="govuk-button govuk-button--warning"
    >
      {children}
    </CustomLink>
  ) : (
    <button
      className="govuk-button govuk-button--warning govuk-button--disabled"
      disabled
      aria-disabled
    >
      {children}
    </button>
  );

const UserPage = (pageData: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();
  const userHasSchemes = pageData.schemes.length > 0;

  function createdDate() {
    if (pageData.created) {
      return moment(pageData.created).format('DD MMMM YYYY');
    } else {
      return '-';
    }
  }
  return (
    <>
      <Meta title="Manage User" />

      <a
        href={`${publicRuntimeConfig.SUB_PATH}/super-admin-dashboard`}
        className="govuk-back-link"
        data-cy="cy-back-button"
      >
        Back
      </a>

      <div className="govuk-!-padding-top-7">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">{pageData.emailAddress}</span>
            <h1 className="govuk-heading-l">Manage a user</h1>
            <h2 className="govuk-heading-m">User Information</h2>
            <SummaryList
              rows={[
                {
                  key: 'Account created',
                  value: createdDate(),
                  action: <></>,
                },
                {
                  key: 'Email',
                  value: pageData.emailAddress,
                  action: <></>,
                },
                {
                  key: 'Roles',
                  value: pageData.role?.label || 'Blocked',
                  action: pageData.role?.label ? (
                    <Link
                      href={`/super-admin-dashboard/user/${pageData.gapUserId}/change-roles`}
                      className="govuk-link"
                    >
                      Change
                    </Link>
                  ) : (
                    <></>
                  ),
                },
                ...(pageData.role?.label !== 'Applicant'
                  ? [
                      {
                        key: 'Department',
                        value: pageData.department?.name ?? '',
                        action: (
                          <Link
                            href={`/super-admin-dashboard/user/${pageData.gapUserId}/change-department`}
                            className="govuk-link"
                          >
                            Change
                          </Link>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
            {(userHasSchemes || pageData.isUserAdmin) && (
              <>
                <h2 className="govuk-heading-m">Grants this user owns</h2>
                {!userHasSchemes ? (
                  <p className="govuk-body">
                    This user does not own any grants.
                  </p>
                ) : (
                  <SummaryList
                    rows={pageData.schemes.map((scheme) => {
                      const queryParams = new URLSearchParams({
                        oldEmailAddress: pageData.emailAddress,
                        schemeName: scheme.name,
                      }).toString();
                      const href = `/super-admin-dashboard/user/${pageData.gapUserId}/schemes/${scheme.schemeId}/change-owner?${queryParams}`;

                      return {
                        key: scheme.name,
                        value: (
                          <Link href={href} className="govuk-link">
                            Change owner
                          </Link>
                        ),
                      };
                    })}
                  />
                )}
              </>
            )}

            {!pageData.isViewingOwnAccount && (
              <div className="govuk-button-group">
                <DeleteButton
                  gapUserId={pageData.gapUserId}
                  userHasSchemes={userHasSchemes}
                >
                  Delete user
                </DeleteButton>

                {!pageData.role?.label && (
                  <CustomLink
                    href={`/api/unblockUser?id=${pageData.gapUserId}`}
                    customStyle="govuk-button govuk-button--secondary"
                  >
                    Unblock user
                  </CustomLink>
                )}

                {pageData.role?.label && (
                  <CustomLink
                    href={`/super-admin-dashboard/user/${pageData.gapUserId}/block-user`}
                    customStyle="govuk-button govuk-button--secondary"
                  >
                    Block user
                  </CustomLink>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPage;
