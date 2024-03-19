import { AxiosError } from 'axios';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { GetServerSidePropsContext } from 'next';
import { getGrantScheme } from '../../../services/SchemeService';
import { render, screen } from '@testing-library/react';
import ApplicationPreview, { getServerSideProps } from './preview.page';
import InferProps from '../../../types/InferProps';

jest.mock('../../../utils/session');
jest.mock('../../../services/ApplicationService');
jest.mock('../../../services/SchemeService');

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {
    backendHost: 'http://localhost:8080',
  },
  publicRuntimeConfig: {
    SUB_PATH: '/apply',
    APPLICANT_DOMAIN: 'http://localhost:8080',
  },
}));

describe('getServerSideProps', () => {
  const testApplicationFormSummary = {
    sections: [
      { sectionId: 'testSectionId', sectionTitle: 'title', questions: [] },
    ],
    grantSchemeId: 'mockGrantSchemeId',
    applicationName: 'mockApplicationName',
    applicationStatus: 'DRAFT' as const,
    audit: {
      version: 1,
      lastPublished: '2021-07-01T00:00:00.000Z',
      lastUpdateBy: 'mockLastUpdateBy',
      lastUpdated: '2021-07-01T00:00:00.000Z',
      created: '2021-07-01T00:00:00.000Z',
      createdBy: 'mockCreatedBy',
    },
    grantApplicationId: 'mockGrantApplicationId',
  };

  const testScheme = {
    contactEmail: 'mock@example.com',
    createdDate: '2021-07-01T00:00:00.000Z',
    encryptedLastUpdatedBy: 'mockEncryptedLastUpdatedBy',
    lastUpdatedBy: 'mockLastUpdatedBy',
    name: 'mockName',
    schemeId: 'mockSchemeId',
    ggisReference: 'mockGgisReference',
    funderId: 'mockFunderId',
    lastUpdatedDate: '2021-07-01T00:00:00.000Z',
    lastUpdatedByADeletedUser: false,
  };
  const context = {
    params: {
      applicationId: 'mockApplicationId',
    },
  } as unknown as GetServerSidePropsContext;

  const axiosError = { response: { data: { code: 500 } } } as AxiosError;

  it('should return props with sections, contactEmail, applicationId, and applicationName', async () => {
    jest
      .mocked(getApplicationFormSummary)
      .mockResolvedValue(testApplicationFormSummary);

    jest.mocked(getGrantScheme).mockResolvedValue(testScheme);

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      props: {
        sections: [
          {
            sectionId: 'testSectionId',
            sectionTitle: 'title',
            questions: [],
          },
        ],
        contactEmail: 'mock@example.com',
        applicationId: 'mockApplicationId',
        applicationName: 'mockApplicationName',
      },
    });
  });

  it('should handle applicationFormSummary error', async () => {
    jest.mocked(getApplicationFormSummary).mockRejectedValue(axiosError);
    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        statusCode: 302,
        destination:
          '/error-page/code/500?href=/build-application/mockApplicationId/dashboard',
      },
    });
  });

  it('should handle getGrantScheme error', async () => {
    jest
      .mocked(getApplicationFormSummary)
      .mockResolvedValue(testApplicationFormSummary);
    jest.mocked(getGrantScheme).mockRejectedValue(axiosError);
    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        statusCode: 302,
        destination:
          '/error-page/code/500?href=/build-application/mockApplicationId/dashboard',
      },
    });
  });
});

describe('SectionInformation', () => {
  const sections = [
    {
      sectionId: 'section1',
      sectionTitle: 'Section 1',
      questions: [{ questionId: 'question1' }, { questionId: 'question2' }],
    },
    {
      sectionId: 'section2',
      sectionTitle: 'Section 2',
      questions: [
        { questionId: 'section2-question1' },
        { questionId: 'section2-question1' },
      ],
    },
  ];

  const props = {
    sections,
    applicationName: 'Test Application',
    applicationId: 'testAppId',
    contactEmail: 'test@example.com',
  } as InferProps<typeof getServerSideProps>;

  it('renders component with correct content', () => {
    render(<ApplicationPreview {...props} />);

    expect(
      screen.getByText(`Previewing ${props.applicationName}`)
    ).toBeVisible();

    expect(
      screen.getByText('See an overview of the questions you will be asked')
    ).toBeVisible();
    expect(screen.getByText('Exit preview')).toBeVisible();
    expect(screen.getByText('Help and support')).toBeVisible();
    expect(
      screen.getByText('If you have a question about this grant, contact:')
    ).toBeVisible();
    expect(screen.getByText(props.contactEmail!)).toBeVisible();
  });

  it('renders correct number of sections', () => {
    render(<ApplicationPreview {...props} />);
    const sectionElements = screen.getAllByTestId('section-information');
    expect(sectionElements.length).toEqual(sections.length);
  });

  it('passes correct props to SectionInformation component', () => {
    render(<ApplicationPreview {...props} />);
    sections.forEach((section, index) => {
      const sectionElement = screen.getAllByTestId('section-information')[
        index
      ];
      expect(sectionElement).toHaveTextContent(section.sectionTitle);
      expect(sectionElement).toHaveTextContent('Not Started');
    });
  });

  it('links each section to the first question id', () => {
    render(<ApplicationPreview {...props} />);
    const links = screen.getAllByTestId('section-link');
    links.forEach((link, index) => {
      expect(link).toHaveAttribute(
        'href',
        `/apply/build-application/${props.applicationId}/${sections[index].sectionId}/${sections[index].questions[0].questionId}/unpublished-preview`
      );
    });
  });
});
