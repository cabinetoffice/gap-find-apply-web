import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import { getUserSchemes } from '../../services/SchemeService';
import Scheme from '../../types/Scheme';
import { generateSchemeTableRows, getServerSideProps } from './index.page';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../services/SchemeService');

const mockSchemeList: Scheme[] = [
  {
    name: 'Scheme name 1',
    schemeId: '123',
    ggisReference: 'ggisReference',
    funderId: '4567',
    createdDate: '2011-12-10T14:48:00',
    lastUpdatedBy: 'test@admin.com',
    lastUpdatedDate: '2011-12-10T14:48:00',
  },
  {
    name: 'Scheme name 2',
    schemeId: '456',
    ggisReference: 'ggisReference',
    funderId: '4562467',
    createdDate: '2011-10-10T14:48:00',
    lastUpdatedBy: 'test2@admin.com',
    lastUpdatedDate: '2011-10-10T14:48:00',
  },
];

describe('SchemeList', () => {
  describe('getServerSideProps', () => {
    const mockedGetUserSchemes = getUserSchemes as jest.MockedFn<
      typeof getUserSchemes
    >;

    it('Should return a list of schemes', async () => {
      mockedGetUserSchemes.mockResolvedValue(mockSchemeList);

      const result = await getServerSideProps({
        req: { cookies: { 'gap-test': 'testSessionId' } },
      } as unknown as GetServerSidePropsContext);

      expect(result).toStrictEqual({ props: { schemes: mockSchemeList } });
    });
  });

  describe('generateSchemeTableRows', () => {
    it('Should create an array of table rows when schemes are passed in', () => {
      const result = generateSchemeTableRows({ schemes: mockSchemeList });
      expect(result).toStrictEqual([
        {
          cells: [
            {
              content: (
                <CustomLink
                  href="/scheme/123"
                  dataCy="cy_linkToScheme_Scheme name 1"
                  ariaLabel="View scheme Scheme name 1"
                >
                  Scheme name 1
                </CustomLink>
              ),
            },
            { content: '10 December 2011, 2:48 pm' },
            { content: '10 December 2011, 2:48 pm' },
            { content: 'test@admin.com' },
          ],
        },
        {
          cells: [
            {
              content: (
                <CustomLink
                  href="/scheme/456"
                  dataCy="cy_linkToScheme_Scheme name 2"
                  ariaLabel="View scheme Scheme name 2"
                >
                  Scheme name 2
                </CustomLink>
              ),
            },
            { content: '10 October 2011, 2:48 pm' },
            { content: '10 October 2011, 2:48 pm' },
            { content: 'test2@admin.com' },
          ],
        },
      ]);
    });
  });
});
