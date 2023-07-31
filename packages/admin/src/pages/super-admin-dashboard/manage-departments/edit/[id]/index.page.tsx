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
import {
  getDepartment,
  updateDepartmentInformation,
} from '../../../../../services/SuperAdminService';
import { Department } from '../../../types';

type PageBodyResponse = Omit<Department, 'id'>;

export function getServerSideProps(context: GetServerSidePropsContext) {
  const fetchPageData = async (jwt: string) => {
    const { name: departmentName, ggisID } = await getDepartment(
      context.params?.id as string,
      jwt
    );
    return {
      id: context.params?.id as string,
      departmentName,
      ggisID,
    };
  };

  const handleRequest = async (body: PageBodyResponse, jwt: string) =>
    updateDepartmentInformation(body, context.params?.id as string, jwt);

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof fetchPageData>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to edit department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/manage-departments/edit/${context.params?.id}`,
  });
}

const EditDepartmentPage = ({
  formAction,
  pageData: { departmentName, ggisID, id },
  csrfToken,
  fieldErrors,
  previousValues,
}: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();

  return (
    <>
      <Meta title="Edit Department" />
      <CustomLink
        isBackButton
        href={'/super-admin-dashboard/manage-departments'}
      />

      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Edit department</h1>
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <TextInput
            questionTitle={`Department name`}
            titleSize="m"
            fieldName="name"
            defaultValue={previousValues?.name || departmentName}
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
            fieldName="ggisID"
            defaultValue={previousValues?.ggisID || ggisID}
            fieldErrors={fieldErrors}
            TitleTag="h2"
          />
          <div className="govuk-button-group">
            <button className="govuk-button" data-module="govuk-button">
              Save changes
            </button>

            <a
              href={`${publicRuntimeConfig.SUB_PATH}/super-admin-dashboard/manage-departments/delete/${id}`}
              className="govuk-button govuk-button--warning"
            >
              Delete department
            </a>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default EditDepartmentPage;
