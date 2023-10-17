import Layout from '../../../components/partials/Layout';
import InferProps from '../../../types/InferProps';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationFundingLocationPage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  mandatoryQuestion,
  mandatoryQuestionId,
}: InferProps<typeof getServerSideProps>) {
  const backButtonUrl = routes.dashboard;
  return (
    <>
      <>
        <Layout backBtnUrl={backButtonUrl}>Funding Location PAGE</Layout>
      </>
    </>
  );
}
