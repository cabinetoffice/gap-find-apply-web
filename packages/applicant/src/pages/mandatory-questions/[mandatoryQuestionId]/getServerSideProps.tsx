import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';
import { Optional } from '../../../testUtils/unitTestHelpers';
import callServiceMethod from '../../../utils/callServiceMethod';
import { generateRedirectForMandatoryQuestionNextPage } from '../../../utils/generateRedirectForMandatoryQuestionNextPage';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';

export default async function getServerSideProps({
  req,
  res,
  query,
  resolvedUrl, //the url that the user requested
}: GetServerSidePropsContext) {
  const mandatoryQuestionId = (query?.mandatoryQuestionId as string) || null;
  const fromSummary = (query?.fromSummary as string) || null;
  const jwt = getJwtFromCookies(req);
  const { publicRuntimeConfig } = getConfig();

  let mandatoryQuestion;
  const grantMandatoryQuestionService =
    GrantMandatoryQuestionService.getInstance();

  try {
    mandatoryQuestion =
      await grantMandatoryQuestionService.getMandatoryQuestionById(
        jwt,
        mandatoryQuestionId
      );
  } catch (e) {
    const serviceErrorProps = {
      errorInformation:
        'Something went wrong while trying to get the page you requested',
      linkAttributes: {
        href: resolvedUrl,
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    };
    return {
      redirect: {
        destination: routes.serviceError(serviceErrorProps),
        permanent: false,
      },
    };
  }

  //only when someone access this page from the summary page,
  //  we want to show the default value
  //otherwise we gonna send it to the next non filled page
  generateRedirectForMandatoryQuestionNextPage(
    mandatoryQuestion,
    mandatoryQuestionId,
    fromSummary === 'true'
  );

  const response = await callServiceMethod(
    req,
    res,
    (body) =>
      grantMandatoryQuestionService.updateMandatoryQuestion(
        jwt,
        mandatoryQuestionId,
        body
      ),
    generateRedirectForMandatoryQuestionNextPage(
      mandatoryQuestion,
      mandatoryQuestionId,
      fromSummary === 'true'
    ).redirect.destination,
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
    (mandatoryQuestion as Optional<GrantMandatoryQuestionDto>) || '';
  let fieldErrors = [] as ValidationError[];

  if ('fieldErrors' in response) {
    fieldErrors = response.fieldErrors;
    defaultFields = response.body as Optional<GrantMandatoryQuestionDto>;
  }

  return {
    props: {
      csrfToken: (req as any).csrfToken?.() || '',
      formAction: publicRuntimeConfig.subPath + resolvedUrl,
      fieldErrors,
      defaultFields,
    },
  };
}
