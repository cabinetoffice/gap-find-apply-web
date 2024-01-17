import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="govuk-template__body js-enabled">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
