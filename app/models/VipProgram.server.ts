
import db from "../db.server";

export async function getVipPrograms(session: any, graphql: any) {


  const vipPrograms = await db.vipProgram.findMany({
    where: { storeId: session.shop }, // this refers to the unique Shop Store ID that is passed from the authentication middleware
    orderBy: { id: "desc" },
  });

  if (vipPrograms.length === 0) return [];

  return vipPrograms;
}

export async function createVipProgram(vipProgram: any, shopId: string, graphql: any) {

  const vipPrograms = await prisma.vipProgram.findMany({
    where: { storeId: shopId }, // this refers to the unique Shop Store ID that is passed from the authentication middleware
    orderBy: { id: "desc" },
  });

  const response = await graphql(
    `
      mutation setMetaField($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields){
          metafields {
            id
            value
            ownerType
            key
            namespace
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      metafields: [
        {
          key: "programs",
          namespace: "$app:vip",
          ownerId: `gid://shopify/Shop/${shopId}`,
          type: "json",
          value: JSON.stringify(vipPrograms),
        }
      ]
    }
  );
  console.log("response: ", response);
  return response;
}