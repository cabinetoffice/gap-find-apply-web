import moment from 'moment';
import { GetServerSideProps } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import { getUserSchemes } from '../../services/SchemeService';
import Scheme from '../../types/Scheme';
import { getSessionIdFromCookies } from '../../utils/session';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const schemes = await getUserSchemes(
    { paginate: false },
    getSessionIdFromCookies(req)
  );
  return {
    props: {
      schemes: schemes,
    },
  };
};

export const generateSchemeTableRows = ({ schemes }: SchemesProps) => {
  return schemes.map((scheme) => {
    const schemeLink = (
      <CustomLink
        href={`/scheme/${scheme.schemeId}`}
        dataCy={`cy_linkToScheme_${scheme.name}`}
        ariaLabel={`View scheme ${scheme.name}`}
      >
        {scheme.name}
      </CustomLink>
    );

    return {
      cells: [
        {
          content: schemeLink,
        },
        { content: dateFormatter(scheme.createdDate) },
        { content: dateFormatter(scheme.lastUpdatedDate) },
        { content: scheme.lastUpdatedBy },
      ],
    };
  });
};

export function dateFormatter(date: string) {
  const utcDate = moment(date).utc();
  return moment(utcDate).local().format('dddd D MMMM YYYY, h:mm a');
}

interface SchemesProps {
  schemes: Scheme[];
}
