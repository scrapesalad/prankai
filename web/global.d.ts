import type React from "react";

export {};

declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientToken: string;
        components: string[];
        pageType?: string;
      }) => Promise<any>;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "paypal-pay-later-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "paypal-credit-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
