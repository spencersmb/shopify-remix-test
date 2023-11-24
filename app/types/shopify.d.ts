// shopify-session-extension.d.ts
import 'shopify-api-node';

declare module 'shopify-api-node' {
  interface Session {
    shopId?: string;  // Add your custom property
  }
}