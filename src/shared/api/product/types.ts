export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
}

export interface FetchProductRequest {
    page: number;
    limit: number;
}