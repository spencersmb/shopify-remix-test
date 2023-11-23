import type { ActionFunction, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("webhook.post.tsx", request)
  try {
    // Verify that the request is a POST request
    // if (request.method !== 'POST') {
    //   return new Response('Method Not Allowed', { status: 405 });
    // }

    // Extract JSON body from the request
    // const payload: WebhookPayload = await request.json();

    // Process the customer data request
    // if (payload && payload.customer && payload.orders_requested) {
    //   // Implement the logic to handle customer data
    //   // This may involve fetching order details, customer information, etc.
    //   // ...

    //   // Respond with a 200 status code to acknowledge receipt
    //   return new Response('Webhook Received', { status: 200 });
    // }

    // If payload is not as expected
    return new Response('Valid Webhook Payload', { status: 200 });
  } catch (error) {
    // Handle any errors
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  console.log("webhook.post.tsx", request)
  return new Response('Valid Webhook Payload', { status: 200 });
};