import {
  Button,
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationNamePage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl = routes.mandatoryQuestions.typePage(mandatoryQuestionId);
  return (
    <>
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
              questionTitle="Enter the name of your organisation"
              questionHintText="This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission"
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
    </>
  );
}
