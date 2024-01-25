import { FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import QuestionPageGetServerSideProps from '../../../../utils/QuestionPageGetServerSideProps';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';
import { getUserTokenFromCookies } from '../../../../utils/session';
import {
  checkUserIsSuperAdmin,
  createDepartmentInformation,
} from '../../../../services/SuperAdminService';
import { Department } from '../../types';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const fetchPageData = async (jwt: string) => checkUserIsSuperAdmin(jwt);

  const handleRequest = async (body: Omit<Department, 'id'>, jwt: string) =>
    createDepartmentInformation(body, jwt);

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to create department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/manage-departments/`,
  });
}

const AddDepartmentPage = ({
  formAction,
  csrfToken,
  fieldErrors,
  previousValues,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Add a Department" />
      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/manage-departments`}
      />
      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <h1 className="govuk-heading-l">Add a department</h1>
          <TextInput
            questionTitle={`Department name`}
            titleSize="m"
            fieldName="name"
            fieldErrors={fieldErrors}
            TitleTag="h2"
            defaultValue={previousValues?.name as string}
          />
          <TextInput
            questionHintText={
              "This should be the department's GGIS ID, not the ID of a grant within it."
            }
            width="10"
            questionTitle={`GGIS ID number`}
            titleSize="m"
            fieldName="ggisID"
            fieldErrors={fieldErrors}
            TitleTag="h2"
            defaultValue={previousValues?.ggisID as string}
          />
          <div className="govuk-button-group">
            <button className="govuk-button" data-module="govuk-button">
              Add department
            </button>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default AddDepartmentPage;
