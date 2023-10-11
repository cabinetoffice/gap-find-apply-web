import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { routes } from '../../utils/routes';

const FirstMandatoryQuestion = () => {
  return (
    <>
      <Meta title="View my applications - Apply for a grant" />

      <Layout backBtnUrl={routes.dashboard}>
        <>NEW PAGE</>
      </Layout>
    </>
  );
};

export default FirstMandatoryQuestion;
