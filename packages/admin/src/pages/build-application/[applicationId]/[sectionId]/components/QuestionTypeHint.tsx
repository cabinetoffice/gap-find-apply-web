import getConfig from 'next/config';
import Image from 'next/image';
import styles from './QuestionTypeHint.module.scss';

const QuestionTypeHint = ({
  description,
  questionType,
  imageFileName,
  imageAlt,
  detailsTitle,
}: QuestionTypeHintProps) => {
  const { publicRuntimeConfig } = getConfig();
  const inputImageLoader = (imageProps: { src: any }) => {
    return `${publicRuntimeConfig.SUB_PATH}/assets/images/inputs/${imageProps.src}`;
  };

  return (
    <>
      {description}
      <details
        className="govuk-details"
        data-module="govuk-details"
        data-cy={`cy-details-${questionType}`}
      >
        <summary
          className="govuk-details__summary"
          data-cy={`cy-details-link-${questionType}`}
        >
          <span className="govuk-details__summary-text">{detailsTitle}</span>
        </summary>
        <div
          className={`govuk-details__text ${styles['gap-question-type-image-wrapper']}`}
        >
          <Image
            loader={inputImageLoader}
            src={`${imageFileName}.png`}
            alt={imageAlt}
            layout={'fill'}
          />
        </div>
      </details>
    </>
  );
};

interface QuestionTypeHintProps {
  description: string;
  questionType: string;
  imageFileName: string;
  imageAlt: string;
  detailsTitle: string;
}

export default QuestionTypeHint;
