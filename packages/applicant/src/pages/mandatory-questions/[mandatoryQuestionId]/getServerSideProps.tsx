import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';
import { Optional } from '../../../testUtils/unitTestHelpers';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';

export default async function getServerSideProps({
  req,
  res,
  params,
  query,
  resolvedUrl, //the url that the user requested
}: GetServerSidePropsContext) {
  const { mandatoryQuestionId } = params as Record<string, string>;
  const { fromSummaryPage = false } = query as Record<string, string>;
  const jwt = getJwtFromCookies(req);
  const { publicRuntimeConfig } = getConfig();

  let mandatoryQuestion: GrantMandatoryQuestionDto;
  const grantMandatoryQuestionService =
    GrantMandatoryQuestionService.getInstance();

  try {
    mandatoryQuestion =
      await grantMandatoryQuestionService.getMandatoryQuestionById(
        mandatoryQuestionId,
        resolvedUrl,
        jwt
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
        statusCode: 302,
      },
    };
  }
  const { isPageAlreadyAnswered, nextNotAnsweredPage } = mandatoryQuestion;
  //only when someone access this page from the summary page,
  //  we want to show the default value
  //otherwise we gonna send it to the next non filled page
  if (isPageAlreadyAnswered && !fromSummaryPage) {
    return {
      redirect: {
        destination: nextNotAnsweredPage,
        statusCode: 302,
      },
    };
  }

  //this is where we update the mandatory question.
  const response = await callServiceMethod(
    req,
    res,
    (body) =>
      grantMandatoryQuestionService.updateMandatoryQuestion(
        jwt,
        mandatoryQuestionId,
        body
      ),
    //where we want to go after we update the mandatory question
    (result) => {
      return fromSummaryPage
        ? routes.mandatoryQuestions.summaryPage(mandatoryQuestionId)
        : result;
    },
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

  let defaultFields = mandatoryQuestion as Optional<GrantMandatoryQuestionDto>;
  let fieldErrors = [] as ValidationError[];

  //if there are validation errors we fill up the default fields with the values that the user has entered, and field errors with the errors
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
      mandatoryQuestion,
      mandatoryQuestionId,
    },
  };
}
