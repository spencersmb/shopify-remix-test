import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";
import type { QRCode } from "@prisma/client";

export async function getQRCode(id: number, graphql: any) {
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  if (!qrCode) {
    return null;
  }

  return supplementQRCode(qrCode, graphql);
  // return qrCode;
}

export async function getQRCodes(shop: string, graphql: any) {
  const qrCodes = await db.qRCode.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (qrCodes.length === 0) return [];

  return Promise.all(
    qrCodes.map((qrCode) => supplementQRCode(qrCode, graphql))
  );
  // return qrCodes;
}

export function getQRCodeImage(id: number) {
  const url = new URL(`/qrcodes/${id}/scan`, process.env.SHOPIFY_APP_URL);
  return qrcode.toDataURL(url.href);
}


// Scanning a QR code takes the user to one of two places:

// The product details page
// A checkout with the product in the cart

// Create a function to conditionally construct this URL depending on the destination that the merchant selects.
export function getDestinationUrl(qrCode: QRCode) {
  if (qrCode.destination === "product") {
    return `https://${qrCode.shop}/products/${qrCode.productHandle}`;
  }

  const match = /gid:\/\/shopify\/ProductVariant\/([0-9]+)/.exec(qrCode.productVariantId);
  invariant(match, "Unrecognized product variant ID");

  return `https://${qrCode.shop}/cart/${match[1]}:1`;
}

// Create a function that queries the Shopify Admin GraphQL API for the product title, and the first featured product image's URL and alt text. It should also return an object with the QR code data and product data, and use the getDestinationUrl and getQRCodeImage functions that you created to get the destination URL's QR code image.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function supplementQRCode(qrCode: QRCode, graphql: any) {
  const qrCodeImagePromise = getQRCodeImage(qrCode.id);

  const response = await graphql(
    `
      query supplementQRCode($id: ID!) {
        product(id: $id) {
          title
          images(first: 1) {
            nodes {
              altText
              url
            }
          }
        }
      }
    `,
    {
      variables: {
        id: qrCode.productId,
      },
    }
  );

  const {
    data: { product },
  } = await response.json();

  return {
    ...qrCode,
    productDeleted: !product?.title,
    productTitle: product?.title,
    productImage: product?.images?.nodes[0]?.url,
    productAlt: product?.images?.nodes[0]?.altText,
    destinationUrl: getDestinationUrl(qrCode),
    image: await qrCodeImagePromise,
  };
}
export interface SupplementalQRCode {
  id: number;
  title: string;
  productHandle: string;
  productVariantId: string;
  destination: string;
  shop: string;
  productDeleted: boolean;
  productTitle?: string;
  productImage?: string;
  productAlt?: string;
  destinationUrl: string;
  image: string;
}
interface QRCodeData {
  title: string;
  productId: string;
  productVariantId: string;
  destination: string;
  shop: string;
}
interface QRCodeErrors {
  title?: string;
  productId?: string;
  productVariantId?: string;
  destination?: string;
}


// To create a valid QR code, the app user needs to provide a title, and select a product and destination.Add a function to ensure that, when the user submits the form to create a QR code, values exist for all of the required fields.

// The REMIX action for the QR code form will return errors from this function.
export function validateQRCode(data: QRCodeData) {
  const errors: QRCodeErrors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (!data.destination) {
    errors.destination = "Destination is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
