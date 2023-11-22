import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node'
// @ts-ignore
import { cors } from 'remix-utils/cors';

// Run Ngrok ./ngrok http {url that remix gives you}
// add that url to the shopify app - https://partners.shopify.com/2288791/apps/71729676289/edit
// then everything should work

export let loader: LoaderFunction = async ({ request, params }) => {

  const response = json({ body: 'data' });

  // return await cors(request, response);
  // ngrok-skip-browser-warning
  return response;
}