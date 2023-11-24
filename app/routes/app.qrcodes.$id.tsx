/* eslint-disable @typescript-eslint/no-unused-vars */
import type { QRCode } from "@prisma/client";
import db from "../db.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import {
  Text,
  BlockStack,
  Card,
  Layout,
  Page,
  TextField,
  InlineStack,
  Button,
  Thumbnail,
  InlineError,
  Bleed,
  Divider,
  ChoiceList,
  EmptyState,
  PageActions,

} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";
import { useState } from "react";
import type { SupplementalQRCode } from "~/models/Qrcode.server";
import { getQRCode, validateQRCode } from "~/models/Qrcode.server";
import { authenticate } from "~/shopify.server";



export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  console.log('SESSION:', session)

  if (params.id === "new") {
    return json({
      destination: "product",
      title: "",
    });
  }

  return json(await getQRCode(Number(params.id), admin.graphql));
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const data: any = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  console.log('ACTION DATA:', data)

  if (data.action === "delete") {
    await db.qRCode.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  const errors = validateQRCode(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const qrCode =
    params.id === "new"
      ? await db.qRCode.create({ data })
      : await db.qRCode.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/qrcodes/${qrCode.id}`);
}

type loaderData = null | SupplementalQRCode | { destination: string, title: string }
export default function QRCodeForm() {
  /*
  ERRORS: If the app user doesn't fill all of the QR code form fields, then the action returns errors to display. This is the return value of validateQRCode, which is accessed through the Remix useActionData hook.
  */
  const errors = useActionData<any>()?.errors || {};

  const qrCode = useLoaderData() as loaderData
  console.log('QRCODE PAGE:', qrCode ? qrCode : 'no qr code')
  const [formState, setFormState] = useState<FormState | null>(qrCode);
  console.log('FORM STATE:', formState)
  const [cleanFormState, setCleanFormState] = useState<FormState | null>(qrCode);

  /*
  isDirty: Determines if the form has changed. This is used to enable save buttons when the app user has changed the form contents, or disable them when the form contents haven't changed.
  */
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0]?.id ?? '',
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }

  const submit = useSubmit();

  function handleSave() {
    if (!formState) return
    const data = {
      title: formState.title ?? "",
      productId: formState.productId || "",
      productVariantId: formState.productVariantId || "",
      productHandle: formState.productHandle || "",
      destination: formState.destination ?? "",
    };

    setCleanFormState({ ...formState });

    submit(data, { method: "post" });
  }

  // Type guard to check if qrCode is of type QRCode
  function isQRCode(data: loaderData): data is SupplementalQRCode {
    return (data as SupplementalQRCode).id !== undefined;
  }

  return (
    <Page>
      <ui-title-bar title={isQRCode(qrCode) ? "Edit QR code" : "Create new QR code"}>
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          QR codes
        </button>
      </ui-title-bar>
      <Layout>

        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Title
                </Text>
                <TextField
                  id="title"
                  helpText="Only store staff can see this title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  value={formState?.title || ""}
                  onChange={(title) => setFormState({ ...formState, title })}
                  error={errors.title}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  {formState?.productId ? (
                    <Button variant="plain" onClick={selectProduct}>
                      Change product
                    </Button>
                  ) : null}
                </InlineStack>
                {formState?.productId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Thumbnail
                      source={formState.productImage || ImageMajor}
                      alt={formState.productAlt || formState.productTitle as string}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.productTitle}
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                    {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </BlockStack>
                )}
                <Bleed marginInlineStart="200" marginInlineEnd="200">
                  <Divider />
                </Bleed>
                <InlineStack gap="500" align="space-between" blockAlign="start">
                  <ChoiceList
                    title="Scan destination"
                    choices={[
                      { label: "Link to product page", value: "product" },
                      {
                        label: "Link to checkout page with product in the cart",
                        value: "cart",
                      },
                    ]}
                    selected={[formState?.destination as string]}
                    onChange={(destination) =>
                      setFormState({
                        ...formState,
                        destination: destination[0],
                      })
                    }
                    error={errors.destination}
                  />
                  {isQRCode(qrCode) && qrCode.destinationUrl ? (
                    <Button
                      variant="plain"
                      url={qrCode.destinationUrl}
                      target="_blank"
                    >
                      Go to destination URL
                    </Button>
                  ) : null}
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Text as={"h2"} variant="headingLg">
              QR code
            </Text>
            {isQRCode(qrCode) && qrCode.image ? (
              <EmptyState image={qrCode.image} imageContained={true} />
            ) : (
              <EmptyState image="">
                Your QR code will appear here after you save
              </EmptyState>
            )}
            <BlockStack gap="300">
              <Button
                disabled={!isQRCode(qrCode) || !qrCode?.image}
                url={isQRCode(qrCode) && qrCode.image ? qrCode.image : undefined}
                download
                variant="primary"
              >
                Download
              </Button>
              <Button
                disabled={!isQRCode(qrCode) || !qrCode?.id}
                url={isQRCode(qrCode) ? `/qrcodes/${qrCode.id}` : undefined}
                target="_blank"
              >
                Go to public URL
              </Button>
            </BlockStack>


          </Card>
        </Layout.Section>

        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !isQRCode(qrCode) || !qrCode.id || !qrCode || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  )
}

interface FormState {
  id?: number;
  title?: string; // assuming title is always present
  shop?: string;
  productId?: string;
  productVariantId?: string;
  productHandle?: string;
  productTitle?: string;
  productAlt?: string;
  productImage?: string;
  destination?: string; // assuming destination is always present
  // ... other properties as needed
}