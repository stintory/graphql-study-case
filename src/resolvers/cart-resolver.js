import { carts, cartItems, products } from '../../database.js';
import { v4 as uuidv4 } from 'uuid';

function getCart(userId) {
    const cart = carts.find(cart => carts.user.id === userId);
    if (!cart) {
        throw new Error ('Cart not found');
    }

    cart.items = cartItems.filter(cartItem => cartItem.cart.id === cart.id);
    cart.totalAmout = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.product.quantity);
    }, 0);

    return cart;
}

const resolvers = {
    Query: {
        getUserCart: (_, { usertId }) => {
            const cart = getCart(userId);
            return cart;
        }
    },

    Mutation: {
        addCartItem: (_, { addCartItemInput }) => {
            const product = products.find(product => product.id === addCartItemInput.productId);
            if (!product) {
                throw new Error("Product not found");
            }
            const cart = getCart(addCartItemInput.userId);

            const newCartItem = {
                id: uuidv4().substring(0, 5),
                quantity: addCartItemInput.quantity,
                product: product,
                cart: cart
            };

            cartItems.push(newCartItem);
            return getCart(addCartItemInput.userId);
        },

        deleteCartItem: (_, { deleteCartItemInput }) => {
            const updatedCartItems = cartItems.filter(item => item.id !== deleteCartItemInput.cartItemId);

            cartItems.length = 0;
            cartItems.push(...updatedCartItems);

            return getCart(deleteCartItemInput.userId);
        }
    }
}

export default resolvers;