export {};

declare global {
  interface Window {
    GOVUKFrontend: {
      initAll: () => void;
    };
  }
}
