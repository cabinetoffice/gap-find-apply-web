import { GetServerSideProps } from 'next';
import { NextIncomingMessage } from 'next/dist/server/request-meta';
import getConfig from 'next/config';
import { FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { Department, User } from '../../types';

type Req = NextIncomingMessage & {
  csrfToken: () => string;
  cookies: Partial<{
    [key: string]: string;
  }>;
};

// @TODO: replace with data from backend when available

let count = 0;

const users = new Array(10).fill(undefined).map(() => ({
  id: count,
  email: `test${count++}@email.com`,
  sub: '1234567',
  roles:
    Math.random() > 0.33
      ? [
          { id: 0, name: 'FIND' },
          { id: 1, name: 'APPLY' },
        ]
      : [
          { id: 0, name: 'FIND' },
          { id: 1, name: 'APPLY' },
          { id: 2, name: 'ADMIN' },
        ],
  department: {
    id: 0,
    name: 'Super cool dept',
  },
}));

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const response = await callServiceMethod(
    req,
    res,
    async () => {
      return {};
    },
    (result) => {
      return '';
    },
    ''
  );

  if ('redirect' in response) {
    return response;
  }

  return {
    props: {
      user: users.find(({ id }) => String(id) === (params?.id as string)),
      departments: [
        { name: 'Some dept', id: 0 },
        { name: 'Some other dept', id: 1 },
        { name: 'This data is made up', id: 2 },
        { name: 'Super cool dept', id: 3 },
      ],
      csrfToken: (req as Req).csrfToken() || '',
    },
  };
};

type UserPageProps = {
  user: User;
  departments: Department[];
  csrfToken: string;
};

const UserPage = ({ departments, user, csrfToken }: UserPageProps) => {
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
                <FlexibleQuestionPageLayout
                  formAction=""
                  csrfToken={csrfToken}
                  fieldErrors={[]}
                >
                  <Radio
                    fieldName="department"
                    radioOptions={departments.map((department) => ({
                      label: department.name,
                      value: department.id,
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
