import axios from 'axios';
import { FormEvent } from 'react';

const postSurveyResponse = async (
  e: FormEvent<HTMLFormElement>,
  backendUrl: string
) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const surveyResponse = {
    satisfaction: formData.get('satisfaction'),
    comment: formData.get('comment'),
  };

  await axios.post(backendUrl, null, { params: surveyResponse });
};

export { postSurveyResponse };
