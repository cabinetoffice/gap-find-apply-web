import { FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ButtonTypePropertyEnum } from '../../components/button/Button';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { SaveAndCancel } from '../../components/save-and-cancel/SaveAndCancel';
import InferProps from '../../types/InferProps';
import { routes } from '../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };

export default function CompaniesHouseNumberPage({
  organisationId,
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation details - Apply for a grant`}
      />

      <Layout backBtnUrl={routes.organisation.index}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter your Companies House number (optional)"
            questionHintText={
              <>
                <p>
                  If your organisation is registered with Companies House, enter
                  your company number below.
                </p>
                <a
                  href="https://find-and-update.company-information.service.gov.uk/?_ga=2.111669508.18905375.1663663866-660770501.1644938489"
                  className="govuk-link govuk-link--no-visited-state"
                  target="_blank"
                  rel="noreferrer"
                >
                  Search for your company number
                </a>
              </>
            }
            fieldName="companiesHouseNumber"
            defaultValue={defaultFields.companiesHouseNumber}
            fieldErrors={fieldErrors}
            width="20"
          />

          <input type="hidden" value={organisationId} name="id" />

          <SaveAndCancel
            type={ButtonTypePropertyEnum.Submit}
            saveButton={{ name: 'Save' }}
            cancelLink={{
              url: routes.organisation.index,
              text: 'Cancel',
              noVisitedState: true,
            }}
          />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
