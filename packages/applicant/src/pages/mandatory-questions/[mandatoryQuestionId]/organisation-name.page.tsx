import {
  Button,
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import getServerSideProps from './getServerSideProps';
import { MQ_ORG_TYPES } from '../../../utils/constants';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationNamePage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  backButtonUrl,
  mandatoryQuestion,
}: InferProps<typeof getServerSideProps>) {
  const isUserIndividual =
    mandatoryQuestion.orgType === MQ_ORG_TYPES.INDIVIDUAL;
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation name - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle={
              isUserIndividual
                ? 'Enter your name'
                : 'Enter the name of your organisation'
            }
            questionHintText={
              isUserIndividual
                ? 'Your name will appear on your application.'
                : 'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission'
            }
            fieldName="name"
            defaultValue={defaultFields.name}
            fieldErrors={fieldErrors}
            width="30"
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
