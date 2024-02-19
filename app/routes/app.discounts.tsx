import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { Button, Card, Page, TextField } from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    const formData = await request.formData();
    const dynamicTitle = formData.get("discountTitle");

    try {

        const startsAt = "2024-02-06T00:00:00Z";
        const endsAt = "2024-03-06T00:00:00Z"; 
        const minimumRequirementSubtotal = 200;
        const discountAmount = 45;

        const response = await admin.graphql(
            `#graphql
                mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
                    discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
                    automaticDiscountNode {
                        id
                        automaticDiscount {
                        ... on DiscountAutomaticBasic {
                            startsAt
                            endsAt
                            minimumRequirement {
                            ... on DiscountMinimumSubtotal {
                                greaterThanOrEqualToSubtotal {
                                amount
                                currencyCode
                                }
                            }
                            }
                            customerGets {
                            value {
                                ... on DiscountAmount {
                                amount {
                                    amount
                                    currencyCode
                                }
                                appliesOnEachItem
                                }
                            }
                            items {
                                ... on AllDiscountItems {
                                allItems
                                }
                            }
                            }
                        }
                        }
                    }
                    userErrors {
                        field
                        code
                        message
                    }
                    }
                }`,
                {
                    variables: {
                    "automaticBasicDiscount": {
                        "title": dynamicTitle,
                        "startsAt": startsAt,
                        "endsAt": endsAt,
                        "minimumRequirement": {
                        "subtotal": {
                            "greaterThanOrEqualToSubtotal": minimumRequirementSubtotal
                        }
                        },
                        "customerGets": {
                        "value": {
                            "discountAmount": {
                            "amount": discountAmount,
                            "appliesOnEachItem": false
                            }
                        },
                        "items": {
                            "all": true
                        }
                        }
                    }
                    },
                },
        )

        if(response) {
            const responseJson = await response.json();
            return json ({
                 discount: responseJson.data
            });  
        }
        return null; 

    } catch(err){
        console.log("err", err);
    }
} 

const Discounts = () => {
    const [discountTitle, setDiscountTitle] = useState('');
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    console.log("actionData", actionData);

    const generateDiscount = () => submit({}, {replace: true, method: 'POST'});
    return (
        <Page>
            <Card>
                <Form onSubmit={generateDiscount} method="post">
                <TextField
                    id="discountTitlesa"
                    name="discountTitle"
                    label="title"
                    autoComplete="off"
                    value={discountTitle}
                    onChange={(value) => setDiscountTitle(value)} />
                    <Button submit>Create Discount</Button>
                </Form>
            </Card>
        </Page>
    )
}

export default Discounts;