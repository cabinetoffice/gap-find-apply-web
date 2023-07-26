import {
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
  SummaryList,
  TextInput,
} from 'gap-web-ui';
// import { getAllDepartments } from '../../../services/SuperAdminService';
// import { getUserTokenFromCookies } from '../../../utils/session';
// import InferProps from '../../../types/InferProps';
// import getConfig from 'next/config';
// import Meta from '../../../components/layout/Meta';
// import CustomLink from '../../../components/custom-link/CustomLink';
import { GetServerSidePropsContext } from 'next';
// import { Department } from '../types';
import { Row } from 'gap-web-ui/dist/cjs/components/summary-list/SummaryList';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import getConfig from 'next/config';
import { Department } from '../../../types';
import InferProps from '../../../../../types/InferProps';
import { getDepartment } from '../../../../../services/SuperAdminService';

export function getServerSideProps(context: GetServerSidePropsContext) {
  // const blah = context.params;
  // const fetchPageData = async (jwt: string) => ({
  //   department: await getDepartment(, jwt),
  // });

  // const handleRequest = async () => {
  //   //update dept
  //   console.log('handle request?');
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  // };

  return {
    props: {
      formAction: '/super-admin-dashboard/manage-departments/edit/1',
      pageData: { departmentName: 'bah', ggisID: 'ggisId' },
      fieldErrors: [],
    },
  };

  // const fetchPageData = async (jwt: string) => ({
  //   department: await getDepartmentName(jwt),
  // });

  // const handleRequest = async () => {
  //   //update dept
  //   console.log('handle request?');
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  // };

  // // return {
  // //   props: {
  // //     pageData: {
  // //       departments: await getAllDepartments(
  // //         getUserTokenFromCookies(context.req)
  // //       ),
  // //     },
  // //   },
  // // };

  // return QuestionPageGetServerSideProps({
  //   context,
  //   fetchPageData,
  //   handleRequest,
  //   jwt: getUserTokenFromCookies(context.req),
  //   onErrorMessage: 'Failed to update roles, please try again later.',
  //   onSuccessRedirectHref: `/super-admin-dashboard/}`,
  // });
}

const EditDepartmentPage = ({
  formAction,
  pageData: { departmentName, ggisID },
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
              <h1 className="govuk-heading-l">Edit department</h1>
              <FlexibleQuestionPageLayout
                fieldErrors={fieldErrors}
                csrfToken=""
                formAction={`${publicRuntimeConfig.SUB_PATH}${formAction}`}
              >
                <TextInput
                  questionTitle={`Department name`}
                  titleSize="m"
                  fieldName={`options[${`"index"`}]`}
                  defaultValue={departmentName}
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
                  fieldName={`options[${`"index"`}]`}
                  defaultValue={ggisID}
                  fieldErrors={fieldErrors}
                  TitleTag="h2"
                />
              </FlexibleQuestionPageLayout>

              <div className="govuk-button-group">
                <button className="govuk-button" data-module="govuk-button">
                  Save changes
                </button>

                <a
                  href={`${publicRuntimeConfig.SUB_PATH}/super-admin-dashboard/manage-departments`}
                  className="govuk-button govuk-button--warning"
                >
                  Delete departments
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
  // const { publicRuntimeConfig } = getConfig();

  // return (
  //   <>
  //     <Meta
  //       title={`${fieldErrors.length > 0 ? 'Error: ' : ''}Manage Departments`}
  //     />
  //     <CustomLink isBackButton href={`/super-admin-dashboard/user/...`} />
  //     <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
  //       <div className="govuk-grid-row">
  //         <div className="govuk-grid-column-full">
  //           <h1 className="govuk-heading-l">Manage a user</h1>
  //           <h2 className="govuk-heading-m">User Information</h2>
  //           <SummaryList
  //             rows={departments.map((dept, i) =>
  //               getDepartmentRow(i, dept, publicRuntimeConfig.SUB_PATH)
  //             )}
  //           />
  //           {/* <span className="govuk-caption-l">{user.emailAddress}</span> */}
  //         </div>
  //       </div>
  //     </main>
  //   </>
  // );
};

const getDepartmentRow = (
  index: number,
  { id, name, ggisID = '' }: Department,
  subPath: string
): Row =>
  index === 0
    ? {
        key: 'Department',
        value: 'GGIS ID',
        action: 'Actions',
      }
    : {
        key: name,
        value: ggisID,
        action: (
          <CustomLink
            href={`${subPath}/super-admin-dashboard/mange-departments/edit/${id}`}
          >
            Edit
          </CustomLink>
        ),
      };

export default EditDepartmentPage;

//http://localhost:3001/apply/admin/super-admin-dashboard/manage-departments
