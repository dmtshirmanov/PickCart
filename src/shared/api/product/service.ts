/** @scopeDefault * */
import { productList } from '_shared/mock/productList';
import { FetchProductRequest, Product } from './types';

class ProductService {
  get(params: FetchProductRequest) {
    return new Promise<Array<Product>>(resolve => {
      setTimeout(() => {
        resolve(productList.slice(params.page * params.limit, (params.page + 1) * params.limit));
      }, 1000);
    });
  }
}

export const productService = new ProductService();
