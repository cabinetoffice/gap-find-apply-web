import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="root-background">
      <Head />
      <body className="govuk-template__body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
