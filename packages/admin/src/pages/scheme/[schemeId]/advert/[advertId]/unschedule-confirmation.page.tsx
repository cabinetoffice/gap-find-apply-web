import { AxiosError } from 'axios';
import { FlexibleQuestionPageLayout, Radio, ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import AdvertStatusEnum from '../../../../../enums/AdvertStatus';
import {
  getAdvertStatusBySchemeId,
  unscheduleAdvert,
} from '../../../../../services/AdvertPageService';
import CustomError from '../../../../../types/CustomError';
import InferProps from '../../../../../types/InferProps';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { generateErrorPageRedirectV2 } from '../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../utils/session';

type RequestBody = {
  confirmation: string;
};

export const getServerSideProps = async ({
  params,
  query,
  resolvedUrl,
  req,
  res,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  const { hasErrors } = query as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);
  let fieldErrors = [] as ValidationError[];
  let grantAdvertData;

  try {
    grantAdvertData = await getAdvertStatusBySchemeId(sessionCookie, schemeId);

    // Redirect if advert is not scheduled before doing anything else
    if (
      grantAdvertData.data?.grantAdvertStatus !== AdvertStatusEnum.SCHEDULED
    ) {
      return generateErrorPageRedirectV2(
        'GRANT_ADVERT_NOT_SCHEDULED',
        `/scheme/${schemeId}`
      );
    }
  } catch (err) {
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;
    return generateErrorPageRedirectV2(
      errorMessageObject.code,
      `/scheme/${schemeId}`
    );
  }

  if (hasErrors === 'true') {
    fieldErrors = [
      {
        fieldName: 'confirmation',
        errorMessage:
          'You must select either "Yes, unschedule my advert" or "No, keep my advert scheduled"',
      },
    ];
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.confirmation === 'true') {
        await unscheduleAdvert(sessionCookie, advertId);
      }

      return body.confirmation;
    },
    (unschedule) => {
      if (unschedule === 'true') {
        return `/scheme/${schemeId}/advert/${advertId}/section-overview`;
      } else if (unschedule === 'false') {
        return `/scheme/${schemeId}/advert/${advertId}/summary`;
      } else {
        return `/scheme/${schemeId}/advert/${advertId}/unschedule-confirmation?hasErrors=true`;
      }
    },
    `/scheme/${schemeId}/advert/${advertId}/summary`
  );

  if ('redirect' in response) {
    return response;
  }

  return {
    props: {
      backHref: `/scheme/${schemeId}/advert/${advertId}/summary`,
      formAction: resolvedUrl,
      fieldErrors: fieldErrors,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const UnscheduleConfirmationPage = ({
  backHref,
  formAction,
  fieldErrors,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Unschedule advert - Manage a grant`}
      />

      <CustomLink
        isBackButton
        href={backHref}
        dataCy="cy-unschedule-confirmation-page-back-button"
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Are you sure you want to change your advert?"
            questionHintText={
              <p
                className="govuk-body"
                data-cy="cy-unschedule-confirmation-hint-text"
              >
                Your advert will be unscheduled. To schedule your advert, you
                will need to review and publish it again.
              </p>
            }
            fieldName="confirmation"
            radioOptions={[
              { label: 'Yes, unschedule my advert', value: 'true' },
              { label: 'No, keep my advert scheduled', value: 'false' },
            ]}
            fieldErrors={fieldErrors}
          />
          <button
            className="govuk-button"
            data-module="govuk-button"
            data-cy="cy_unscheduleConfirmation-ConfirmButton"
          >
            Confirm
          </button>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default UnscheduleConfirmationPage;
