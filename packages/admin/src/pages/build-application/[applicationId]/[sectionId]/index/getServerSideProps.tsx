import { GetServerSidePropsContext } from 'next';
import {
  getApplicationFormSummary,
  getApplicationStatus,
  handleQuestionOrdering,
} from '../../../../../services/ApplicationService';
import ServiceError from '../../../../../types/ServiceError';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { generateErrorPageParams } from '../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../utils/session';

const getServerSideProps = async ({
  params,
  req,
  res,
  query,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { applicationId, sectionId } = params as Record<string, string>;
  const { scrollPosition } = query as Record<string, string>;
  const sessionId = getSessionIdFromCookies(req);

  const result = await callServiceMethod(
    req,
    res,
    async (body) => {
      const params = Object.keys(body)[1].split('/');
      const increment = params[0] === 'Up' ? -1 : 1;
      const questionId = params[1];

      await handleQuestionOrdering({
        sessionId,
        applicationId,
        sectionId,
        questionId,
        increment,
        version: body.version,
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

  const applicationStatus = await getApplicationStatus(
    applicationId,
    sessionId
  );

  if (
    applicationStatus === 'PUBLISHED' ||
    sectionId.toUpperCase() === 'ELIGIBILITY' ||
    sectionId.toUpperCase() === 'ESSENTIAL'
  ) {
    return {
      redirect: {
        destination: `/build-application/${applicationId}/dashboard`,
        permanent: false,
      },
    };
  } else if (
    applicationStatus === 'REMOVED' &&
    (sectionId === 'ELIGIBILITY' || sectionId === 'ESSENTIAL')
  ) {
    return {
      redirect: {
        destination: `/build-application/${applicationId}/dashboard`,
        permanent: false,
      },
    };
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
      version: applicationFormSummary.audit.version,
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
    href: `/dashboard`,
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
