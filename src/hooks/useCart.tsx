import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Toast } from 'react-toastify/dist/components';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}


interface UpdateProductAmount {
  productId: number;
  amount: number;
}
interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => void;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  
  

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productExist = updatedCart.find(product=> product.id === productId)

      const stock = await api.get(`/stock/${productId}`)

      const stockAmount = stock.data.amount
      const currentAmount = productExist ? productExist.amount : 0;
      const amount = currentAmount + 1

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      if(productExist) {
        productExist.amount = amount
      }else{
        const product = await api.get(`/products/${productId}`)

        const newProduct = {
          ...product.data,
          amount: 1
        }
        updatedCart.push(newProduct)
      }
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na adição do produto');
      return
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const products = [...cart]
      let selectedProduct =  products.findIndex(product => product.id === productId)
      let productExist = products.some(product => product.id === productId)

      if(!productExist){
        setCart(cart)
        return toast.error('Erro na remoção do produto');
      }

      products.splice(selectedProduct,1)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(products))

      setCart(products)
      
    } catch {
      return toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount<=0){
        return
      }

      const stock = await api.get(`/stock/${productId}`)

      const stockAmount = stock.data.amount;

      if (amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId);

      if (productExists) {
        productExists.amount = amount;
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }else{
        throw Error()
      }
      // const products = [...cart]
      // let selectedProduct =  products.find(product => product.id === productId)

      // const getStock = await fetch(`http://localhost:3333/stock/${productId}`)
      // const stockData = await getStock.json()
      // if(!selectedProduct){
      //   return toast.error('Erro na alteração de quantidade do produto');
      // }

      // if(selectedProduct){
      //   if(selectedProduct.amount < stockData.amount ){
      //     return toast.error('Quantidade solicitada fora de estoque');
      //   }else{
      //     if(amount < 1){
      //       return toast.error('O valor não pode ser atualizado a um numero menor que 1')
      //     }else{
      //       selectedProduct.amount = amount
      //       setCart(products)
      //       localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      //   }}
      // }else{
      //   throw Error()
      // }
      
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
