import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { Button, Card, Page, TextField } from "@shopify/polaris";
import { useState } from "react";
import { createCustomer } from "~/api/prisma.server";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    const dynamicCustomerName = formData.get("customerName"); 
    const dynamicCustomerEmail = formData.get("customerEmail");

    try {
      const response = await admin.graphql(  
        `#graphql
        mutation customerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            userErrors {
              field
              message
            }
            customer {
              id
              email
              phone
              taxExempt
              firstName
              lastName
              smsMarketingConsent {
                marketingState
                marketingOptInLevel
              }
              addresses {
                address1
                city
                country
                phone
                zip
              }
            }
          }
        }`,
        {
          variables: {
            "input": {
                "email": dynamicCustomerEmail,
                "phone": "+16469555533",
                "firstName": dynamicCustomerName,
                "lastName": "Lastname",
                "addresses": [
                  {
                    "address1": "412 fake st",
                    "city": "Ottawa",
                    "province": "ON",
                    "phone": "+16469999933",
                    "zip": "A1A 4A1",
                    "lastName": "Lastname",
                    "firstName": "Steve",
                    "country": "CA"
                  }
                ]
            }
          },
        },
      );

      if(response.ok ) {
        console.log("hit");
          const data = await response.json();
          
          await createCustomer({
            name: dynamicCustomerName,
            email: dynamicCustomerEmail
          })

          return json ({
                data: data.data
          });  
      }
      return null; 

    } catch(err){
        console.log("err", err);
        return null;
    }
} 

const Customer = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    console.log("actionData", actionData);

    const generateCustomer = () => submit({}, {replace: true, method: 'POST'});
    return (
        <Page>
            <Card>
                <Form onSubmit={generateCustomer} method="post">
                  <TextField
                    id="customerEmail"
                    name="customerEmail"
                    label="email"
                    autoComplete="off"
                    value={email}
                    onChange={(value) => setEmail(value)} />
                  <TextField
                    id="customerName"
                    name="customerName"
                    label="name"
                    autoComplete="off"
                    value={name}
                    onChange={(value) => setName(value)} />
                  <Button submit>Create Customer</Button>
                </Form>
            </Card>
        </Page>
    )
}

export default Customer;