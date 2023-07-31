import {
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
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

  const handleRequest = async (_body: { _csrf: string }, jwt: string) =>
    deleteDepartmentInformation(context.params?.id as string, jwt);

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to delete department, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/manage-departments/`,
  });
}

const DeleteDepartmentPage = ({
  formAction,
  pageData: { id },
  csrfToken,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Delete Department" />
      <CustomLink isBackButton href={'/super-admin-dashboard/'} />
      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <h1 className="govuk-heading-l">Delete department</h1>
          <p className="govuk-body">
            If you delete this department, all of its information will be lost.
            You cannot undo this action.
          </p>
          <div className="govuk-button-group">
            <button
              className="govuk-button govuk-button--warning"
              data-module="govuk-button"
            >
              Delete department
            </button>
            <a
              className="govuk-link"
              href={`/super-admin-dashboard/manage-departments/edit/${id}`}
            >
              Cancel
            </a>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default DeleteDepartmentPage;
