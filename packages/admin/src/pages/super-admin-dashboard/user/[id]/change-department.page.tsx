import { GetServerSidePropsContext } from 'next';
import {
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
  Radio,
} from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import {
  getChangeDepartmentPage,
  updateDepartment,
} from '../../../../services/SuperAdminService';
import { getUserTokenFromCookies } from '../../../../utils/session';
import InferProps from '../../../../types/InferProps';
import CustomLink from '../../../../components/custom-link/CustomLink';

type PageBodyResponse = {
  department: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params?.id as string;

  function handleRequest(body: PageBodyResponse, jwt: string) {
    return updateDepartment(userId, body.department, jwt);
  }

  function fetchPageData(jwt: string) {
    return getChangeDepartmentPage(userId, jwt);
  }

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof getChangeDepartmentPage>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to update department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/user/${userId}`,
  });
}

const UserPage = ({
  csrfToken,
  pageData,
  formAction,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  const { user, departments } = pageData;
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Manage User - Change Department`}
      />

      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/user/${user.gapUserId}`}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          csrfToken={csrfToken}
          fieldErrors={fieldErrors}
        >
          <span className="govuk-caption-l">{user.emailAddress}</span>
          <h1 className="govuk-heading-l">Change the user&apos;s department</h1>

          <Radio
            fieldName="department"
            radioOptions={departments.map((department) => ({
              label: department.name,
              value: department.id,
            }))}
            fieldErrors={fieldErrors}
            defaultChecked={user.department?.name}
          />

          <div className="govuk-button-group">
            <button className="govuk-button" data-module="govuk-button">
              Change department
            </button>

            {/* TODO implement link GAP-1931 */}
            <a href="/TODO" className="govuk-link">
              Manage departments
            </a>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default UserPage;
