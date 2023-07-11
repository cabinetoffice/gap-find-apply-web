import { GetServerSideProps } from 'next';
import { NextIncomingMessage } from 'next/dist/server/request-meta';
import getConfig from 'next/config';
import { FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { users } from '../../index.page';
import { Department, User } from '../../types';

type Req = NextIncomingMessage & {
  csrfToken: () => string;
  cookies: Partial<{
    [key: string]: string;
  }>;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {},
    () => {},
    ''
  );

  if ('redirect' in response) {
    return response;
  }

  return {
    props: {
      user: users.find(({ id }) => String(id) === (params?.id as string)),
      departments: [
        'Some dept',
        'Some other dept',
        'This data is made up',
        'Super cool dept',
      ],
      csrfToken: (req as Req).csrfToken() || '',,
    },
  };
};

type UserPageProps = {
  user: User;
  departments: Department[];
};

const UserPage = ({ departments, user }: UserPageProps) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Manage User - Change Department" />
      <div className="govuk-!-padding-top-2">
        <div className="govuk-width-container">
          <a
            href={`${publicRuntimeConfig.SUB_PATH}/spadmin-dashboard`}
            className="govuk-back-link"
            data-cy="cy-back-button"
          >
            Back
          </a>
          <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <span className="govuk-caption-l">{user.email}</span>
                <h1 className="govuk-heading-l">
                  Change the user&apos;s department
                </h1>
                <FlexibleQuestionPageLayout formAction="" fieldErrors={[]}>
                  <Radio
                    fieldName="department"
                    radioOptions={departments.map((department) => ({
                      label: department,
                      value: department,
                    }))}
                    fieldErrors={[]}
                  />
                  <div className="govuk-button-group">
                    <a
                      href=""
                      role="button"
                      draggable="false"
                      className="govuk-button"
                      data-module="govuk-button"
                    >
                      Change department
                    </a>
                    <a href="" className="govuk-link">
                      Manage departments
                    </a>
                  </div>
                </FlexibleQuestionPageLayout>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default UserPage;
