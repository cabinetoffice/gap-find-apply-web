import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';
import Meta from '../../../components/partials/Meta';
import { Button, Details, FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { SaveAndCancel } from '../../../components/save-and-cancel/SaveAndCancel';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';

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
            questionTitle="Choose your organisation type"
            questionHintText="Choose the option that best describes your organisation"
            fieldName="type"
            fieldErrors={fieldErrors}
            radioOptions={[
              { label: 'Limited company', value: 'Limited company' },
              { label: 'Non-limited company', value: 'Non-limited company' },
              { label: 'Registered charity', value: 'Registered charity' },
              { label: 'Unregistered charity', value: 'Unregistered charity' },
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
