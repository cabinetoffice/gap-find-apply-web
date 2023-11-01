import { Button, FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationTypePage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl =
    routes.mandatoryQuestions.addressPage(mandatoryQuestionId);
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation type - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          formAction={formAction}
        >
          <Radio
            questionTitle="Choose your application type"
            questionHintText="Choose the option that best describes you or your organisation"
            fieldName="orgType"
            fieldErrors={fieldErrors}
            radioOptions={[
              { label: 'Limited company', value: 'Limited company' },
              { label: 'Non-limited company', value: 'Non-limited company' },
              { label: 'Charity', value: 'Charity' },
              {
                label: 'I am applying as an Individual',
                value: 'I am applying as an Individual',
              },
              { label: 'Other', value: 'Other' },
            ]}
            defaultChecked={defaultFields.orgType}
          />

          <Button
            text="Save and continue"
            type={ButtonTypePropertyEnum.Submit}
          />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
