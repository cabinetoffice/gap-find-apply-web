import { type ReactNode } from 'react';

type InsetTextProps = {
  children: ReactNode;
};

const InsetText = ({ children }: InsetTextProps) => {
  return (
    <div className={`govuk-inset-text`} data-testid="inset-text">
      {children}
    </div>
  );
};

export default InsetText;
