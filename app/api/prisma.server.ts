
export const createCustomer = async ({email, name}: any) => {
    return await prisma.customer.create({
      data: {
         id: '1',
         name: name,
         email: email
      } as any
 })
}