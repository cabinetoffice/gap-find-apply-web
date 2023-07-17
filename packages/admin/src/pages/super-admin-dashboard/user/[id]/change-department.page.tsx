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
import { getSessionIdFromCookies } from '../../../../utils/session';
import InferProps from '../../../../types/InferProps';
import CustomLink from '../../../../components/custom-link/CustomLink';
import getConfig from 'next/config';

type PageBodyResponse = {
  department: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  function processPagePostResponse(body: PageBodyResponse, jwt: string) {
    return updateDepartment(jwt, context.params?.id as string, body.department);
  }

  function fetchPageData(jwt: string) {
    return getChangeDepartmentPage(context.params?.id as string, jwt);
  }

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof getChangeDepartmentPage>>,
    typeof processPagePostResponse
  >({
    context,
    fetchPageData,
    processPagePostResponse,
    jwt: getSessionIdFromCookies(context.req),
    onErrorMessage: '',
    onSuccessRedirectHref: `/super-admin-dashboard/user/${context.params?.id}`,
  });
}

const UserPage = ({
  csrfToken,
  pageData,
  formAction,
}: InferProps<typeof getServerSideProps>) => {
  const { user, departments } = pageData;
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Manage User - Change Department" />

      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/user/${user.gap_user_id}`}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={`${publicRuntimeConfig.SUB_PATH}${formAction}`}
          csrfToken={csrfToken}
          fieldErrors={[]}
        >
          <span className="govuk-caption-l">{user.email}</span>
          <h1 className="govuk-heading-l">Change the user&apos;s department</h1>

          <Radio
            fieldName="department"
            radioOptions={departments.map((department) => ({
              label: department.name,
              value: department.id,
            }))}
            fieldErrors={[]}
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
