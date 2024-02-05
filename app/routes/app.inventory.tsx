import { LoaderFunction, json} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";


export const loader: LoaderFunction = async ({ request }) => {

  const  { admin, session } = await authenticate.admin(request);

  try {
    const response = await admin.rest.resources.InventoryLevel.all({
        session: session,
        location_ids: '92745433380'
    })

    if(response){
        const data = response.data
        
        return json({
            inventory: data
        })

    }

    return null

  } catch(err){
    console.log(err)
  }
}

const Inventory = () => {  

    const data: any = useLoaderData();
    console.log("Inventory products:", data);

  return <div>app.inventory</div>;
};

export default Inventory;