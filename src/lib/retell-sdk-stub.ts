/**
 * Retell SDK Stub for Browser
 * 
 * The actual retell-sdk uses Node.js crypto module and can't run in browser.
 * This stub is used during build/browser runtime.
 * 
 * The REAL retell-sdk is only used server-side in:
 * - api/retell-webhook.js
 * - api/retell-get-web-token.js
 * - server.js
 */

// Stub class that matches Retell SDK interface
class RetellStub {
  constructor(config: any) {
    console.warn('⚠️ Retell SDK stub loaded (browser mode). Real SDK only works server-side.');
  }

  agent = {
    create: async (config: any) => {
      throw new Error('Retell SDK can only be used server-side. This should not be called in browser.');
    },
    list: async () => {
      throw new Error('Retell SDK can only be used server-side.');
    },
    retrieve: async (id: string) => {
      throw new Error('Retell SDK can only be used server-side.');
    },
  };

  call = {
    createPhoneCall: async (config: any) => {
      throw new Error('Retell SDK can only be used server-side.');
    },
    retrieve: async (id: string) => {
      throw new Error('Retell SDK can only be used server-side.');
    },
  };

  llm = {
    create: async (config: any) => {
      throw new Error('Retell SDK can only be used server-side.');
    },
    list: async () => {
      throw new Error('Retell SDK can only be used server-side.');
    },
  };

  phoneNumber = {
    list: async () => {
      throw new Error('Retell SDK can only be used server-side.');
    },
  };
}

export default RetellStub;

