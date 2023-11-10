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

    const usersSchemes = await getAdminsSchemes(userId, sessionId);

    return {
      isViewingOwnAccount,
      ...user,
      schemes: usersSchemes,
    };
  };

  return await fetchDataOrGetRedirect(getPageData);
};

const UserPage = (pageData: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();
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
                ...(pageData.role?.label !== 'Applicant'
                  ? [
                      {
                        key: 'Department',
                        value: pageData.department?.name ?? '',
                        action: (
                          <Link
                            href={`/super-admin-dashboard/user/${pageData.gapUserId}/change-department`}
                          >
                            <a className="govuk-link">Change</a>
                          </Link>
                        ),
                      },
                    ]
                  : []),
                {
                  key: 'Roles',
                  value: pageData.role?.label || 'Blocked',
                  action: pageData.role?.label ? (
                    <Link
                      href={`/super-admin-dashboard/user/${pageData.gapUserId}/change-roles`}
                    >
                      <a className="govuk-link">Change</a>
                    </Link>
                  ) : (
                    <></>
                  ),
                },
              ]}
            />

            {
              <>
                <h2 className="govuk-heading-m">Grants this user owns</h2>
                {pageData.schemes.length === 0 ? (
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
                          <Link href={href}>
                            <a className="govuk-link">Change owner</a>
                          </Link>
                        ),
                      };
                    })}
                  />
                )}
              </>
            }

            {!pageData.isViewingOwnAccount && (
              <div className="govuk-button-group">
                <CustomLink
                  href={`/super-admin-dashboard/user/${pageData.gapUserId}/delete-user`}
                  customStyle="govuk-button govuk-button--warning"
                  data-module="govuk-button"
                >
                  Delete user
                </CustomLink>
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
