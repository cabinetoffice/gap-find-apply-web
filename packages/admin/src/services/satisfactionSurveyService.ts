import axios from 'axios';
import { FormEvent } from 'react';

const postSurveyResponse = async (
  e: FormEvent<HTMLFormElement>,
  backendUrl: string
) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  if (!formData.get('satisfaction') && formData.get('comment') === '') {
    return await axios.post('#', null, {
      params: {
        fieldErrors: {
          fieldName: 'satisfaction',
          errorMessage: 'Please complete at least one field',
        },
      },
    });
  } else {
    const surveyResponse = {
      satisfaction: formData.get('satisfaction'),
      comment: formData.get('comment'),
    };

    await axios.post(backendUrl, null, { params: surveyResponse });
    // TODO - replace dummy value
    return 'nextPageUrl';
  }
};

export { postSurveyResponse };
