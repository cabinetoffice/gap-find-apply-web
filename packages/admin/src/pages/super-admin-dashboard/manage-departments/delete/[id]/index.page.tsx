import {
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
  TextInput,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import getConfig from 'next/config';
import InferProps from '../../../../../types/InferProps';
import { getUserTokenFromCookies } from '../../../../../utils/session';
import { deleteDepartmentInformation } from '../../../../../services/SuperAdminService';
import { Department } from '../../../types';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const fetchPageData = async () => {
    return { id: context.params?.id as string };
  };

  const handleRequest = async (id: any, jwt: string) => {
    console.log('id', id);
    deleteDepartmentInformation({ id }, jwt);
  };

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to delete department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/manage-departments/edit/${context.params?.id}`,
  });
}

const DeleteDepartmentPage = ({
  formAction,
  pageData: { id },
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();

  return (
    <>
      <div className="govuk-grid-row govuk-!-padding-top-2">
        <Meta title="Edit Department" />
        <CustomLink isBackButton href={'/super-admin-dashboard/'} />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
            <div className="govuk-grid-row">
              <h1 className="govuk-heading-l">Delete department</h1>
              <FlexibleQuestionPageLayout
                fieldErrors={fieldErrors}
                csrfToken={csrfToken}
                formAction={publicRuntimeConfig.SUB_PATH + formAction}
              >
                <div className="govuk-button-group">
                  <button
                    className="govuk-button govuk-button--warning"
                    data-module="govuk-button"
                  >
                    Delete department
                  </button>
                  <a
                    href={`${publicRuntimeConfig.SUB_PATH}/super-admin-dashboard/manage-departments/edit/${id}`}
                  >
                    Cancel
                  </a>
                </div>
              </FlexibleQuestionPageLayout>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DeleteDepartmentPage;
