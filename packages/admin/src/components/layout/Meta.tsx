import getConfig from 'next/config';
import Head from 'next/head';

const Meta = ({ title, keywords, description }: MetaProps) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <Head>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta name="theme-color" content="#0b0c0c" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />

      <link
        rel="shortcut icon"
        sizes="16x16 32x32 48x48"
        href={`${publicRuntimeConfig.SUB_PATH}/assets/images/favicon.ico`}
        type="image/x-icon"
      />
      <link
        rel="mask-icon"
        href={`${publicRuntimeConfig.SUB_PATH}/assets/images/govuk-mask-icon.svg`}
        color="#0b0c0c"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${publicRuntimeConfig.SUB_PATH}/assets/images/govuk-apple-touch-icon-180x180.png`}
      />
      <link
        rel="apple-touch-icon"
        sizes="167x167"
        href={`${publicRuntimeConfig.SUB_PATH}/assets/images/govuk-apple-touch-icon-167x167.png`}
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href={`${publicRuntimeConfig.SUB_PATH}/assets/images/govuk-apple-touch-icon-152x152.png`}
      />
      <link
        rel="apple-touch-icon"
        href={`${publicRuntimeConfig.SUB_PATH}/assets/images/govuk-apple-touch-icon.png`}
      />
      <meta
        property="og:image"
        content="/assets/images/govuk-opengraph-image.png"
      />
    </Head>
  );
};

Meta.defaultProps = {
  title: 'Manage a grant',
  keywords: 'manage a grant, manage, grant, government',
  description: 'Create, update, delete, manage your grants',
};

interface MetaProps {
  title: string;
  keywords: string;
  description: string;
}

export default Meta;
