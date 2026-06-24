export {};

// GOV.UK Frontend types
declare global {
  interface Window {
    GOVUKFrontend: {
      initAll: () => void;
    };
  }
}
