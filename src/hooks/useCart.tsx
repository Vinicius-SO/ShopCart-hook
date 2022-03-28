import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
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
  addProduct: (productId: number) => Promise<void>;
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
      const products = [...cart]
      let selectedProduct =  products.find(product => product.id === productId)
      console.log(selectedProduct)

      const getProduct = await fetch(`http://localhost:3333/products/${productId}`)
      const productData = await getProduct.json()
      

      const getStock = await fetch(`http://localhost:3333/stock/${productId}`)
      const stockData = await getStock.json()

      if(stockData.amount === selectedProduct?.amount){
        toast.error('Quantidade solicitada fora de estoque');
      }else{
 
        if(selectedProduct){
          selectedProduct.amount = selectedProduct.amount + 1
          console.log('Just update')
          console.log(selectedProduct.amount)
        }else{
          products.push({
            ...productData,
            amount:1,
          })
          console.log(products)
        }
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(products))
        setCart(products)
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const products = [...cart]
      let selectedProduct =  products.findIndex(product => product.id === productId)

      products.splice(selectedProduct,1)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(products))

      setCart(products)
      
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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
