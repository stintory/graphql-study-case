// import { products, ProductType } from '../../database.js';
// import { v4 as uuidv4 } from 'uuid';
// import { withFilter } from 'graphql-subscriptions'; // 조건에 따라 구독자에게 이벤트 전달.

// const resolvers = {
//     Product: {
//         __resolveType(obj) {
//             if (obj.productType === ProductType.ELECTRONICS) return 'Electronics';
//             if (obj.productType === ProductType.CLOTHING) return 'Clothing';
//             return null;
//         }
//     },

//     Query: {
//         getProducts: () => products
//     },

//     Mutation: {
//         addProduct: (_, { addProductInput }, { pubsub }) => {
//             if (!pubsub) {
//                 console.error('pubsub is not available');
//                 return null;
//             }
//             const newProduct = {
//                 id: uuidv4().substring(0, 5),
//                 name: addProductInput.name,
//                 price: addProductInput.price,
//                 productType: addProductInput.productType,
//                 warrantyPeriod: addProductInput.warrantyPeriod,
//                 size: addProductInput.size
//             };
//             products.push(newProduct);

//             pubsub,publish('NEW_PRODUCT', { newProduct });
//             return newProduct;
//         }
//     },

//     Subscription: {
//         newProduct: {
//             subscribe: withFilter(
//                 (_, __, { pubsub }) => pubsub.asyncIterator('NEW_PRODUCT'),
//                 (payload, variables) => {
//                     if(variables.productName == null) {
//                         return true;
//                     }
//                     else if(payload.newProduct.name.includes(variables.productName)) {
//                         return true;
//                     }
//                     else {
//                         return false;
//                     }
//                 }
//             )
//         },
//     }
// }

// export default resolvers;

// prisma
import { ProductType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { withFilter } from 'graphql-subscriptions';

const resolvers = {
    Product: {
        __resolveType(obj) {
            if (obj.productType === ProductType.ELECTRONICS) return 'Electronics';
            if (obj.productType === ProductType.CLOTHING) return 'Clothings';
            return null;
        }
    },

    Query: {
        getProducts: async (_, __, { Prisma }) => {
            return await Prisma.product.findMany();
        }
    },

    Mutation: {
        addProduct: async (_, { addProductInput }, {pubsub, prisma }) => {
            if (!pubsub) {
                console.error('pubsub is not available');
                return null;
            }

            const newProduct = await prisma.product.create({
                data: {
                    id: uuidv4().substring(0,5), // Prisma에서 UUID 자동생성도 가능 하지만 일단 코드를 그대로 리펙토링
                    name: addProductInput.name,
                    price: addProductInput.price,
                    productType: addProductInput.productType,
                    warrantyPeriod: addProductInput.warrantyPeriod ?? null,
                    size: addProductInput.szie ?? null,
                }
            });

            pubsub.publish('NEW_PRODUCT', { newProduct });
            return newProduct;
        }
    },

    Subscription: {
        newProduct: {
            subscribe: withFilter(
                (_, __, { pubsub }) => pubsub.asyncIterator('NEW_PRODUCT'),
                (payload, variables) => {
                    const { productName } = variables;
                    if (!productName) return true;
                    return payload.newProduct.name.includes(productName);
                  }
            )
        }
    }
};

export default resolvers;