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

// 1. create the page to figma (start by copy and pasting the existing preview page found here: packages/admin/src/pages/build-application/[applicationId]/[sectionId]/[questionId]/preview.page.tsx
// 2. dynamically populate the 'Preview next question' button - it needs to link to the next question id. You can get the next question id by checking the location of the current questionid against the array. Find that index then add 1 to it.
// 3. For last question behaviour - You'll know if you're on the last question  when the index of the current question is the same as the length of the question array - 1. (array index start at 0 in js)
