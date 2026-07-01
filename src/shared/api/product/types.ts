/** @scopeDefault * */
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
}

export interface FetchProductRequest {
  page: number;
  limit: number;
}
