import { AxiosError } from 'axios';
import { FlexibleQuestionPageLayout, Radio, ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import {
  getAdvertStatusBySchemeId,
  unpublishAdvert,
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

    // Redirect if advert is not published before doing anything else
    if (grantAdvertData.data?.grantAdvertStatus !== 'PUBLISHED') {
      return generateErrorPageRedirectV2(
        'GRANT_ADVERT_NOT_PUBLISHED',
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
          "You must select either ‘Yes, unpublish my advert' or ‘No, keep my advert on Find a grant.'",
      },
    ];
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.confirmation === 'true') {
        await unpublishAdvert(sessionCookie, advertId);
      }

      return body.confirmation;
    },
    (unpublished) => {
      if (unpublished === 'true') {
        return `/scheme/${schemeId}/advert/${advertId}/section-overview?recentlyUnpublished=true`;
      } else if (unpublished === 'false') {
        return `/scheme/${schemeId}/advert/${advertId}/summary`;
      } else {
        return `/scheme/${schemeId}/advert/${advertId}/unpublish-confirmation?hasErrors=true`;
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

const UnpublishConfirmationPage = ({
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
        }Unpublish advert - Manage a grant`}
      />

      <CustomLink isBackButton href={backHref} />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Are you sure you want to unpublish this advert?"
            questionHintText={
              <div>
                <p className="govuk-body">
                  Once unpublished, your advert will no longer appear on Find a
                  grant.
                </p>
                <p className="govuk-body">
                  If you used this service to build an application form that is
                  linked to this advert, and you want to stop applicants from
                  submitting, you need to unpublish the application form too.
                </p>
              </div>
            }
            fieldName="confirmation"
            radioOptions={[
              { label: 'Yes, unpublish my advert', value: 'true' },
              {
                label: 'No, keep my advert on Find a grant',
                value: 'false',
              },
            ]}
            fieldErrors={fieldErrors}
          />
          <button
            className="govuk-button"
            data-module="govuk-button"
            data-cy="cy_unpublishConfirmation-ConfirmButton"
          >
            Confirm
          </button>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default UnpublishConfirmationPage;
