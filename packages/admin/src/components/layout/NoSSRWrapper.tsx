import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

type NoSSRWrapperProps = {
  children: ReactNode;
};

// Intended to be used as a wrapper aroudn the elements that should not be rendered when JS is disabled on the browser.
// In most cases we will want to use it in conjunction with a <noscript> block which would render instead.
const NonSSRWrapper = ({ children }: NoSSRWrapperProps) => <>{children}</>;

// There are various reasons why we might want to disable server side rendering:
// Component compatibility, external library's consistent performance or reliance on JS to function
// Specific use case why we added this is to ensure consistent use of richtext component for the application (which relies on JS to function)
export default dynamic(() => Promise.resolve(NonSSRWrapper), { ssr: false });
