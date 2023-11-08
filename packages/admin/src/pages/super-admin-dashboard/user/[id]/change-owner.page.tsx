import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';

export async function getServerSideProps() {
  return {
    props: {
      fieldErrors: [],
      user: { gapUserId: 1 },
      grantName: 'Grant Name',
      schemeId: 1,
      defaultValue: '',
      formAction: '',
      csrfToken: '',
    },
  };
}

const ChangeOwnerPage = ({
  fieldErrors,
  user,
  grantName,
  schemeId,
  defaultValue,
  formAction,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
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
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <span className="govuk-caption-xl">{grantName}</span>
          <h1 className="govuk-heading-l">Select a new owner</h1>
          <p className="govuk-body">
            You can select any admin account on the Find a grant service as a
            new owner for this grant. The new owner will be able to view, edit,
            and delete this grant. The previous owner will no longer be able to
            access this grant.
          </p>
          <TextInput
            questionTitle="New owner's email address"
            fieldName="emailAdress"
            fieldErrors={fieldErrors}
            defaultValue={defaultValue}
            textInputSubtype="email"
          />
          <Button text="Continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default ChangeOwnerPage;
