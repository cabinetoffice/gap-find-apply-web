import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PreviewSearchResultCard from './PreviewSearchResultCard';

const testGrant = {
  grantName: 'Testing Grant',
  grantShortDescription:
    'This is the short description. Lorem ipsum dolor sit amet consectetur adipiscing elit lectus mus, pretium cras pharetra cum sem quisque dignissim condimentum duis tristique, proin id accumsan platea dapibus nostra eros mi. Iaculis egestas sapien ac orci vehicula turpis tortor, nascetur nullam leo vitae ultrices viverra erat, senectus diam sociis lacus eleifend donec.',
  grantLocation: ['England', 'Wales', 'Scotland', 'Northern Ireland'],
  grantFundingOrganisation: "The Grant Funders' Organisation",
  grantApplicantType: [
    'Personal / Individual',
    'Public Sector',
    'Non-profit',
    'Private Sector',
    'Local authority',
  ],
  grantTotalAwardAmount: '£1 million',
  grantMaximumAward: '£500,000',
  grantMinimumAward: '£100',
  grantApplicationOpenDate: ['01', '01', '2024', '00', '00'],
  grantApplicationCloseDate: ['01', '1', '2026', '00', '00'],
};

const props = {
  grant: testGrant,
};

const labels = {
  grantLocation: 'Location',
  grantFundingOrganisation: 'Funding organisation',
  grantApplicantType: 'Who can apply',
  grantTotalAwardAmount: 'Grant scheme size',
  grantMinimumMaximumAward: 'How much you can get',
  grantApplicationOpenDate: 'Opening date',
  grantApplicationCloseDate: 'Closing date',
};

describe('PreviewSearchCard', () => {
  it('should display the search result card content', async () => {
    render(<PreviewSearchResultCard {...props} />);
    screen.getByText(props.grant.grantName);
    screen.getByText(testGrant.grantShortDescription);

    screen.getByText(labels.grantLocation);
    screen.getByText(testGrant.grantLocation.join(', '));

    screen.getByText(labels.grantFundingOrganisation);
    screen.getByText(props.grant.grantFundingOrganisation);

    screen.getByText(labels.grantApplicantType);
    screen.getByText(testGrant.grantApplicantType.join(', '));

    screen.getByText(labels.grantTotalAwardAmount);
    screen.getByText(testGrant.grantTotalAwardAmount);

    screen.getByText(labels.grantMinimumMaximumAward);
    screen.getByText(
      `From ${testGrant.grantMinimumAward} to ${testGrant.grantMaximumAward}`
    );

    screen.getByText(labels.grantApplicationOpenDate);
    screen.getByText('1 January 2024, 12:01am');

    screen.getByText(labels.grantApplicationCloseDate);
    screen.getByText('31 December 2025, 11:59pm');
  });

  it('should render the regular time if it is not midnight', () => {
    const modifiedProps = {
      grant: {
        ...testGrant,
        grantApplicationOpenDate: ['01', '01', '2024', '11', '00'],
        grantApplicationCloseDate: ['31', '12', '2025', '23', '00'],
      },
    };
    render(<PreviewSearchResultCard {...modifiedProps} />);

    screen.getByText(labels.grantApplicationOpenDate);
    screen.getByText('1 January 2024, 11:00am');

    screen.getByText(labels.grantApplicationCloseDate);
    screen.getByText('31 December 2025, 11:00pm');
  });

  it('should render empty if data does not exist yet', () => {
    const emptyProps = {
      grant: {
        grantName: '',
        grantShortDescription: '',
        grantLocation: [],
        grantFundingOrganisation: '',
        grantApplicantType: [],
        grantTotalAwardAmount: '',
        grantMaximumAward: '',
        grantMinimumAward: '',
        grantApplicationOpenDate: [],
        grantApplicationCloseDate: [],
      },
    };
    render(<PreviewSearchResultCard {...emptyProps} />);

    expect(screen.getByTestId('GrantName')).toHaveTextContent('');
    expect(screen.getByTestId('ShortDescription')).toHaveTextContent('');
    expect(screen.getByTestId('LocationValue')).toHaveTextContent('');
    expect(screen.getByTestId('FundingOrganisationValue')).toHaveTextContent(
      ''
    );
    expect(screen.getByTestId('ApplicantTypeValue')).toHaveTextContent('');
    expect(screen.getByTestId('MinimumMaximumAwardValue')).toHaveTextContent(
      ''
    );
    expect(screen.getByTestId('TotalAwardAmountValue')).toHaveTextContent('');
    expect(screen.getByTestId('ApplicationOpenDateValue')).toHaveTextContent(
      ''
    );
    expect(screen.getByTestId('ApplicationCloseDateValue')).toHaveTextContent(
      ''
    );
  });
});
