import { NextRedirect } from '../utils/QuestionPageGetServerSidePropsTypes';

type InferGetServerSideProps<T> = Exclude<Awaited<ReturnType<T>>, NextRedirect>;

export default InferGetServerSideProps;
