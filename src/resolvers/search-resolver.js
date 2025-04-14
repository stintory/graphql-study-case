// import { products, users, ProductType } from "../../database.js";

// const resolvers = {
//     SearchResult: {
//         __resolveType(obj) {
//             if (obj.email) {
//                 return 'User';
//             }
//             if (obj.productType === ProductType.ELECTRONICS) {
//                 return 'Electronics';
//             }
//             if (obj.productType === ProductType.CLOTHING) {
//                 return "Clothing";
//             }
//             return null;
//         }
//     },

//     Query: {
//         search: (_, { keyword }) => {
//             const userResults = users.filter(user => user.name.includes(keyword));
//             const productResult = products.filter(product => product.name.includes(keyword));
//             return [...userResults, ...productResult];
//         }
//     }
// }

// export default resolvers;

const resolvers = {
    SearchResult: {
        __resolveType(obj) {
            if (obj.email) return 'User';
            if (obj.productType === 'ELECTRONICS') return 'Electronics';
            if (obj.productType === 'CLOTHING') return 'Clothong';
            return null;
        }
    },

    Query: {
        search: async (_, { keyword }, { prisma }) => {
            const usersResult = await prisma.user.findMany({
                where: {
                    name: {
                        contains: keyword,
                        mode: 'insensiive'
                    }
                }
            });

            const productsResult = await prisma.product.findMany({
                where: {
                    name: {
                        contains: keyword,
                        mode: 'insensitive'
                    }
                }
            });
            
            return [...usersResult, ...productsResult];
        }
    }
};

export default resolvers;