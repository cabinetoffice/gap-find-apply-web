import '!style-loader!css-loader!sass-loader!../src/styles/global.scss';
import { useEffect } from 'react';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (story) => {
    useEffect(() => {
      const GOVUKFrontend = window.GOVUKFrontend;
      if (typeof GOVUKFrontend !== 'undefined') {
        GOVUKFrontend.initAll();
      }
    }, []);

    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">{story()}</div>
      </div>
    );
  },
];
