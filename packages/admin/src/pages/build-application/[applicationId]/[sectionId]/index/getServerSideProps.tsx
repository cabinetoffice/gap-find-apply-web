import { GetServerSidePropsContext } from 'next';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import {
  getApplicationFormSummary,
  handleQuestionOrdering,
} from '../../../../../services/ApplicationService';
import { generateErrorPageParams } from '../../../../../utils/serviceErrorHelpers';
import ServiceError from '../../../../../types/ServiceError';

const getServerSideProps = async ({
  params,
  req,
  res,
  query,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { applicationId, sectionId } = params as Record<string, string>;
  const { scrollPosition } = query as Record<string, string>;

  const result = await callServiceMethod(
    req,
    res,
    async (body) => {
      const sessionId = getSessionIdFromCookies(req);
      const params = Object.keys(body)[0].split('/');
      const increment = params[0] === 'Up' ? -1 : 1;
      const questionId = params[1];
      await handleQuestionOrdering({
        sessionId,
        applicationId,
        sectionId,
        questionId,
        increment,
      });
    },
    `/build-application/${applicationId}/${sectionId}?scrollPosition=${scrollPosition}`,
    generateErrorPageParams(
      'Something went wrong while trying to update section order.',
      `/build-application/${applicationId}/dashboard`
    )
  );

  if ('redirect' in result) {
    return result;
  }

  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    return redirectError;
  }

  const section = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  );

  if (!section) {
    return redirectError;
  }

  return {
    props: {
      section,
      grantApplicationName: applicationFormSummary.applicationName,
      applicationId: applicationFormSummary.grantApplicationId,
      scrollPosition: Number(scrollPosition ?? 0),
      resolvedUrl: process.env.SUB_PATH + resolvedUrl,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const errorProps: ServiceError = {
  errorInformation: 'Something went wrong while trying to edit a section',
  linkAttributes: {
    href: `/scheme-list`,
    linkText: 'Please find your scheme application form and continue.',
    linkInformation: 'Your previous progress has been saved.',
  },
};

const redirectError = {
  redirect: {
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorProps
    )}`,
    permanent: false,
  },
};

export default getServerSideProps;