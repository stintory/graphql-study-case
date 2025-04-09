import { products, users, ProductType } from "../../database.js";

const resolvers = {
    SearchResult: {
        __resolveType(obj) {
            if (obj.email) {
                return 'User';
            }
            if (obj.productType === ProductType.ELECTRONICS) {
                return 'Electronics';
            }
            if (obj.productType === ProductType.CLOTHING) {
                return "Clothing";
            }
            return null;
        }
    },

    Query: {
        search: (_, { keyword }) => {
            const userResults = users.filter(user => user.name.includes(keyword));
            const productResult = products.filter(product => product.name.includes(keyword));
            return [...userResults, ...productResult];
        }
    }
}

export default resolvers;