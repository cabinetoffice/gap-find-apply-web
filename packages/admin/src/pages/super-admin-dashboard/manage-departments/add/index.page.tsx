import {
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
  TextInput,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import getConfig from 'next/config';
import InferProps from '../../../../types/InferProps';
import { getUserTokenFromCookies } from '../../../../utils/session';
import { createDepartmentInformation } from '../../../../services/SuperAdminService';
import { Department } from '../../types';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const fetchPageData = async (jwt: string) => {
    return { jwt };
  };

  const handleRequest = async (body: Omit<Department, 'id'>, jwt: string) =>
    createDepartmentInformation(body, jwt);

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to create department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/manage-departments/edit/${context.params?.id}`,
  });
}

const AddDepartmentPage = ({
  formAction,
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();

  return (
    <>
      <div className="govuk-grid-row govuk-!-padding-top-2">
        <Meta title="Add a Department" />
        <CustomLink isBackButton href={'/super-admin-dashboard/'} />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
            <div className="govuk-grid-row">
              <h1 className="govuk-heading-l">Add a department</h1>
              <FlexibleQuestionPageLayout
                fieldErrors={fieldErrors}
                csrfToken={csrfToken}
                formAction={publicRuntimeConfig.SUB_PATH + formAction}
              >
                <TextInput
                  questionTitle={`Department name`}
                  titleSize="m"
                  fieldName="departmentName"
                  fieldErrors={fieldErrors}
                  TitleTag="h2"
                />
                <TextInput
                  questionHintText={
                    'This should be the departments GGIS ID, not the ID of a grant within it.'
                  }
                  width="10"
                  questionTitle={`GGGIS ID number`}
                  titleSize="m"
                  fieldName="ggisId"
                  fieldErrors={fieldErrors}
                  TitleTag="h2"
                />
                <div className="govuk-button-group">
                  <button className="govuk-button" data-module="govuk-button">
                    Add Department
                  </button>
                </div>
              </FlexibleQuestionPageLayout>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AddDepartmentPage;
