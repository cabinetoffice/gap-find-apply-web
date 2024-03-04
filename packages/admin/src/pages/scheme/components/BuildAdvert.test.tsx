import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BuildAdvert from './BuildAdvert';
import {
  getAdvertPublishInformationBySchemeIdResponse,
  getAdvertStatusBySchemeIdResponse,
} from '../../../services/AdvertPageService.d';
import { getPageProps } from '../../../testUtils/unitTestHelpers';
import AdvertStatusEnum from '../../../enums/AdvertStatus';

describe('BuildAdvert component', () => {
  const getDefaultProps = () =>
    ({
      status: 200,
      data: {
        lastUpdatedByEmail: 'my-email',
        grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
        grantAdvertStatus: 'SCHEDULED',
        contentfulSlug: 'some-contentful-slug',
        openingDate: '2023-03-30T23:01:00Z',
        closingDate: null,
        firstPublishedDate: null,
        lastPublishedDate: null,
        lastUpdated: '2023-03-30T23:01:00Z',
        lastUnpublishedDate: null,
        unpublishedDate: null,
      },
    } as getAdvertPublishInformationBySchemeIdResponse);
  const grantAdvertId = getDefaultProps();

  describe('BuildAdvert - no grant advert', () => {
    const dummyGrantAdvertDataWithNoAdvert: getAdvertPublishInformationBySchemeIdResponse =
      {
        status: 404,
      };
    beforeEach(() => {
      render(
        <BuildAdvert
          schemeId="12345"
          grantAdvert={dummyGrantAdvertDataWithNoAdvert}
        />
      );
    });

    it('Should render correct section title', () => {
      screen.getByRole('heading', { name: 'Grant advert' });
    });

    it('Should render section description', () => {
      screen.getByText('Create and publish an advert for your grant.');
    });

    it('Should render a "Create advert" button', () => {
      expect(
        screen.getByRole('button', { name: 'Create advert' })
      ).toHaveAttribute('href', '/apply/scheme/12345/advert/name');
    });
  });

  describe('BuildAdvert - with draft grant advert', () => {
    beforeEach(() => {
      render(
        <BuildAdvert
          schemeId="12345"
          grantAdvert={getPageProps(getDefaultProps, {
            data: {
              grantAdvertStatus: AdvertStatusEnum.DRAFT,
            },
          })}
        />
      );
    });

    it('Should render correct section title', () => {
      screen.getByRole('heading', { name: 'Grant advert' });
    });

    expect(
      screen.queryByText(
        'It was published by my-email on 31 March 2023 at 00:01.'
      )
    ).toBeNull();

    it('Should render section description', () => {
      screen.getByText(
        'You have created an advert, but it is not live on Find a grant.'
      );
    });

    it('Should render a "View or change your advert" link', () => {
      expect(
        screen.getByRole('link', { name: 'View or change your advert' })
      ).toHaveAttribute(
        'href',
        `/apply/scheme/12345/advert/${grantAdvertId?.data?.grantAdvertId}/section-overview`
      );
    });
  });

  describe('BuildAdvert - with published grant advert', () => {
    beforeEach(() => {
      render(
        <BuildAdvert
          schemeId="12345"
          grantAdvert={getPageProps(getDefaultProps, {
            data: {
              grantAdvertStatus: AdvertStatusEnum.PUBLISHED,
            },
          })}
        />
      );
    });

    it('Should render correct section title', () => {
      screen.getByRole('heading', { name: 'Grant advert' });
    });

    it('Should render a description for the published grant', () => {
      screen.getByText('An advert for this grant is live on Find a grant.');
    });

    it('Should render a link to view advert on Find a grant', () => {
      expect(
        screen.getByRole('link', {
          name: 'https://www.find-government-grants.service.gov.uk/grants/some-contentful-slug',
        })
      ).toHaveAttribute(
        'href',
        'https://www.find-government-grants.service.gov.uk/grants/some-contentful-slug'
      );
    });

    it('Should render a description to edit a grant', () => {
      expect(
        screen.getByText(
          'It was published by my-email on 30 March 2023 at 23:01 PM.'
        )
      ).toBeVisible();
      screen.getByText(
        'You can make changes to your advert or unpublish it here:'
      );
    });

    it('Should render a "View or change your advert" link', () => {
      expect(
        screen.getByRole('link', { name: 'View or change your advert' })
      ).toHaveAttribute(
        'href',
        `/apply/scheme/12345/advert/${grantAdvertId?.data?.grantAdvertId}/summary`
      );
    });
  });

  describe('BuildAdvert - with scheduled grant advert', () => {
    beforeEach(() => {
      render(
        <BuildAdvert
          schemeId="12345"
          grantAdvert={getPageProps(getDefaultProps)}
        />
      );
    });

    it('Should render correct section title', () => {
      screen.getByRole('heading', { name: 'Grant advert' });
      expect(
        screen.getByText(
          'Your advert was scheduled to be published on 30 March 2023 at 23:01 PM by my-email.'
        )
      ).toBeVisible();
    });

    it('Should render a description for the scheduled grant', () => {
      screen.getByText(
        'Your advert is scheduled to be published on 30 March 2023.'
      );
    });

    it('Should render a "View or change your advert" link', () => {
      expect(
        screen.getByRole('link', { name: 'View or change your advert' })
      ).toHaveAttribute(
        'href',
        `/apply/scheme/12345/advert/${grantAdvertId?.data?.grantAdvertId}/summary`
      );
    });
  });

  describe('BuildAdvert - with scheduled grant advert', () => {
    const dummyGrantAdvertDataWithAdvert: getAdvertStatusBySchemeIdResponse = {
      status: 200,
      data: {
        grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
        grantAdvertStatus: AdvertStatusEnum.SCHEDULED,
        contentfulSlug: 'some-contentful-slug',
      },
    };
    beforeEach(() => {
      render(
        <BuildAdvert
          schemeId="12345"
          grantAdvert={getPageProps(getDefaultProps)}
        />
      );
    });

    it('Should not render a link to view advert on Find a grant', () => {
      expect(
        screen.queryByRole('link', {
          name: 'https://www.find-government-grants.service.gov.uk/grants/some-contentful-slug',
        })
      ).toBeNull();
    });

    it('Should render a "View or change your advert" link', () => {
      expect(
        screen.getByRole('link', { name: 'View or change your advert' })
      ).toHaveAttribute(
        'href',
        `/apply/scheme/12345/advert/${dummyGrantAdvertDataWithAdvert?.data?.grantAdvertId}/summary`
      );
    });
  });
});
