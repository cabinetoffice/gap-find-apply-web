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

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../utils/jwt');

const spiedExistBySchemeIdAndApplicantId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'existBySchemeIdAndApplicantId'
);
const spiedGetMandatoryQuestionBySchemeId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'getMandatoryQuestionBySchemeId'
);

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
    it('should return the scheme Id query param when mandatory Question does not exist', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(false);

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
    });
    it('should return the scheme Id query param when mandatory Question does exist but not been completed', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(true);
      const getMandatoryQuestionBySchemeId =
        spiedGetMandatoryQuestionBySchemeId.mockResolvedValue(
          mandatoryQuestionData
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

    it('should redirect if there is an error', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      spiedExistBySchemeIdAndApplicantId.mockRejectedValue('error');

      const response = await getServerSideProps(getContext(getDefaultContext));

      expect(response).toEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve your mandatory questions","linkAttributes":{"href":"/mandatory-questions/start?schemeId=1","linkText":"Please return","linkInformation":" and try again."}}`,
          permanent: false,
        },
      });
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
