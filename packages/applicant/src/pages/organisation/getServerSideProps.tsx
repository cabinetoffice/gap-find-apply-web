import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import { GrantApplicantOrganisationProfile } from '../../models/GrantApplicantOrganisationProfile';
import { GrantApplicantOrganisationProfileService } from '../../services/GrantApplicantOrganisationProfileService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import callServiceMethod from '../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import { Optional } from '../../testUtils/unitTestHelpers';

export default async function getServerSideProps({
  req,
  res,
  resolvedUrl,
}: GetServerSidePropsContext) {
  const jwt = getJwtFromCookies(req);
  const grantApplicantService = GrantApplicantService.getInstance();
  const grantApplicantOrganisationProfileService =
    GrantApplicantOrganisationProfileService.getInstance();
  const { organisation } = await grantApplicantService.getGrantApplicant(jwt);

  const response = await callServiceMethod(
    req,
    res,
    (body) =>
      grantApplicantOrganisationProfileService.updateOrganisation(body, jwt),
    routes.organisation.index,
    {
      errorInformation:
        'Something went wrong while trying to update your organisation details',
      linkAttributes: {
        href: resolvedUrl,
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    }
  );

  if ('redirect' in response) {
    return response;
  }

  let defaultFields =
    organisation as Optional<GrantApplicantOrganisationProfile>;
  let fieldErrors = [] as ValidationError[];
  if ('fieldErrors' in response) {
    fieldErrors = response.fieldErrors;
    defaultFields =
      response.body as Optional<GrantApplicantOrganisationProfile>;
  }

  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      organisationType: organisation.type,
      organisationId: organisation.id,
      csrfToken: (req as any).csrfToken?.() || '',
      formAction: publicRuntimeConfig.subPath + resolvedUrl,
      fieldErrors,
      defaultFields,
    },
  };
}
