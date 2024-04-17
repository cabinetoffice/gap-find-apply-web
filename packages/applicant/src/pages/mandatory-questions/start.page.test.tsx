import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../services/GrantMandatoryQuestionService';
import {
  Optional,
  getContext,
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import InferProps from '../../types/InferProps';
import { getJwtFromCookies } from '../../utils/jwt';
import MandatoryQuestionsBeforeYouStart, {
  getServerSideProps,
} from './start.page';
import { GrantSchemeService } from '../../services/GrantSchemeService';
import { has } from 'cypress/types/lodash';

jest.mock('../../utils/parseBody');
jest.mock('../../utils/jwt');
jest.mock('../../services/ApplicationService');

const spiedExistBySchemeIdAndApplicantId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'existBySchemeIdAndApplicantId'
);
const spiedGetMandatoryQuestionBySchemeId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'getMandatoryQuestionBySchemeId'
);
const spiedHasSchemeInternalApplication = jest.spyOn(
  GrantSchemeService.prototype,
  'hasSchemeInternalApplication'
);

const publishedInternalApplicationResponse = {
  hasInternalApplication: true,
  hasPublishedInternalApplication: true,
  hasAdvertPublished: true,
};

const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
  req: {
    headers: {
      referer: `${process.env.HOST}/test/path`,
    },
  },
  query: { schemeId: '1' },
});

const mandatoryQuestionData: GrantMandatoryQuestionDto = {
  schemeId: 1,
  submissionId: null,
  name: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  county: null,
  postcode: null,
  charityCommissionNumber: null,
  companiesHouseNumber: null,
  orgType: null,
  fundingAmount: null,
  fundingLocation: null,
};

describe('Mandatory Questions Start', () => {
  describe('getServerSideProps', () => {
    it('should return the scheme Id query param when mandatory Question does not exist and advert is published and has internal published application', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(false);
      const hasSchemeInternalApplication =
        spiedHasSchemeInternalApplication.mockResolvedValue(
          publishedInternalApplicationResponse
        );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        props: {
          schemeId: '1',
        },
      });
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalled();
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalledWith(
        '1',
        'testJwt'
      );
      expect(hasSchemeInternalApplication).toHaveBeenCalled();
      expect(hasSchemeInternalApplication).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should return the scheme Id query param when mandatory Question does exist but not been completed and advert is published and has internal published application', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(true);
      const getMandatoryQuestionBySchemeId =
        spiedGetMandatoryQuestionBySchemeId.mockResolvedValue(
          mandatoryQuestionData
        );
      const hasSchemeInternalApplication =
        spiedHasSchemeInternalApplication.mockResolvedValue(
          publishedInternalApplicationResponse
        );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        props: {
          schemeId: '1',
        },
      });
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalled();
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalledWith(
        '1',
        'testJwt'
      );
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalled();
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalledWith(
        'testJwt',
        '1'
      );
      expect(hasSchemeInternalApplication).toHaveBeenCalled();
      expect(hasSchemeInternalApplication).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to submissions list when mandatory Question does exist and are completed', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(true);
      const getMandatoryQuestionBySchemeId =
        spiedGetMandatoryQuestionBySchemeId.mockResolvedValue({
          ...mandatoryQuestionData,
          submissionId: '1',
        });

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        redirect: {
          destination: '/applications',
          permanent: false,
        },
      });
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalled();
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalledWith(
        '1',
        'testJwt'
      );
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalled();
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalledWith(
        'testJwt',
        '1'
      );
    });

    it('should redirect if there is an error retrieving MQ', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      spiedExistBySchemeIdAndApplicantId.mockRejectedValue(new Error());

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve your mandatory questions","linkAttributes":{"href":"/mandatory-questions/start?schemeId=1","linkText":"Please return","linkInformation":" and try again."}}`,
          permanent: false,
        },
      });
    });

    it('should redirect to grant is closed page if mq dont exist and  advert is published and has internal application in a NOT published status', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      spiedExistBySchemeIdAndApplicantId.mockResolvedValue(false);
      const hasSchemeInternalApplication =
        spiedHasSchemeInternalApplication.mockResolvedValue({
          ...publishedInternalApplicationResponse,
          hasPublishedInternalApplication: false,
        });

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        redirect: {
          destination: `/grant-is-closed`,
          permanent: false,
        },
      });
      expect(hasSchemeInternalApplication).toHaveBeenCalled();
      expect(hasSchemeInternalApplication).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to 404 page if mq dont exist and advert is unpublished/not existent and has internal application in a NOT published status', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      spiedExistBySchemeIdAndApplicantId.mockResolvedValue(false);
      const hasSchemeInternalApplication =
        spiedHasSchemeInternalApplication.mockResolvedValue({
          ...publishedInternalApplicationResponse,
          hasPublishedInternalApplication: false,
          hasAdvertPublished: false,
        });

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        redirect: {
          destination: `/404`,
          permanent: false,
        },
      });
      expect(hasSchemeInternalApplication).toHaveBeenCalled();
      expect(hasSchemeInternalApplication).toHaveBeenCalledWith('1', 'testJwt');
    });
  });

  describe('UI', () => {
    it('should display the page', () => {
      const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
        schemeId: '1',
      });
      renderWithRouter(
        <MandatoryQuestionsBeforeYouStart {...getPageProps(getDefaultProps)} />
      );

      screen.getByRole('heading', {
        name: /Before you start/i,
      });
    });
  });
});
