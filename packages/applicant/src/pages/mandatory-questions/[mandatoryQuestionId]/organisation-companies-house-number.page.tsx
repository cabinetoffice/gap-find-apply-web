import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';
import Meta from '../../../components/partials/Meta';
import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { SaveAndCancel } from '../../../components/save-and-cancel/SaveAndCancel';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationCompaniesHouseNumberPage({
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
        }Companies House number - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter your Companies House number (if you have one)"
            questionHintText={
              <>
                <p>
                  Funding organisation might use this to identify your
                  organisation when you apply for a grant. It might also be used
                  to check your organisation is legitimate.
                </p>
                <a
                  href="https://find-and-update.company-information.service.gov.uk/?_ga=2.111669508.18905375.1663663866-660770501.1644938489"
                  className="govuk-link govuk-link--no-visited-state"
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cy="cy-search-companies-house-number"
                >
                  Search for your company number (opens in new tab)
                </a>
              </>
            }
            fieldName="companiesHouseNumber"
            defaultValue={defaultFields.companiesHouseNumber}
            fieldErrors={fieldErrors}
            width="20"
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
