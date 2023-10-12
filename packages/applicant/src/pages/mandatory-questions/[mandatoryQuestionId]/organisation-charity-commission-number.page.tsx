import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationCharityCommissionNumberPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl = routes.dashboard;
  return (
    <>
      <>
        <Layout backBtnUrl={backButtonUrl}>
          organisation-charity-commission-number PAGE
        </Layout>
      </>
    </>
  );
}
