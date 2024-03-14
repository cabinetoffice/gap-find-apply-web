export { getServerSideProps };

const getServerSideProps = async ({ params }: any) => {
  const sectionId = params.sectionId.toString();
  const questionId = params.questionId.toString();

  return {
    props: {
      pageData: { sectionId, questionId },
    },
  };
};

export default function DummyComponent({ pageData }: any) {
  return (
    <p>
      {"Hey, here's the data you need ->"}, {JSON.stringify({ pageData })}
    </p>
  );
}
