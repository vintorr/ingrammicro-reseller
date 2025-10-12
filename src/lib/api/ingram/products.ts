import { apiClient } from '../client';
import type {
  Product,
  ProductSearchRequest,
  ProductSearchResponse,
  PriceAvailabilityRequest,
  PriceAvailabilityResponse,
} from '../../types';

export class ProductsApi {
  async searchProducts(params: ProductSearchRequest): Promise<ProductSearchResponse> {
    // Check if we have the required environment variables
    if (!process.env.INGRAM_CLIENT_ID || !process.env.INGRAM_CLIENT_SECRET) {
      console.warn('Ingram Micro API credentials not configured. Using mock data.');
      return this.getMockProducts(params);
    }

    try {
      const endpoint = '/resellers/v6/catalog';
      return apiClient.get<ProductSearchResponse>(endpoint, params);
    } catch (error) {
      console.warn('Ingram Micro API error. Using mock data:', error);
      return this.getMockProducts(params);
    }
  }

  private getMockProducts(params: ProductSearchRequest): ProductSearchResponse {
    const mockProducts: Product[] = [
      {
        ingramPartNumber: 'MOCK001',
        vendorPartNumber: 'LAPTOP001',
        vendorName: 'Dell',
        description: 'Dell OptiPlex 7090 Desktop Computer',
        productCategory: 'Computers',
        productSubcategory: 'Desktop Computers',
        productClass: 'Desktop',
        upc: '123456789012',
        vendorNumber: 'DELL001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK002',
        vendorPartNumber: 'LAPTOP002',
        vendorName: 'HP',
        description: 'HP EliteBook 850 Laptop Computer',
        productCategory: 'Computers',
        productSubcategory: 'Laptop Computers',
        productClass: 'Laptop',
        upc: '123456789013',
        vendorNumber: 'HP001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK003',
        vendorPartNumber: 'LAPTOP003',
        vendorName: 'Lenovo',
        description: 'Lenovo ThinkPad X1 Carbon Laptop',
        productCategory: 'Computers',
        productSubcategory: 'Laptop Computers',
        productClass: 'Laptop',
        upc: '123456789014',
        vendorNumber: 'LENOVO001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK004',
        vendorPartNumber: 'LAPTOP004',
        vendorName: 'Apple',
        description: 'Apple MacBook Pro 13-inch Laptop',
        productCategory: 'Computers',
        productSubcategory: 'Laptop Computers',
        productClass: 'Laptop',
        upc: '123456789015',
        vendorNumber: 'APPLE001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK005',
        vendorPartNumber: 'SERVER001',
        vendorName: 'Dell',
        description: 'Dell PowerEdge R750 Server',
        productCategory: 'Servers',
        productSubcategory: 'Rack Servers',
        productClass: 'Server',
        upc: '123456789016',
        vendorNumber: 'DELL002',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK006',
        vendorPartNumber: 'NETWORK001',
        vendorName: 'Cisco',
        description: 'Cisco Catalyst 9300 Switch',
        productCategory: 'Networking',
        productSubcategory: 'Switches',
        productClass: 'Network Equipment',
        upc: '123456789017',
        vendorNumber: 'CISCO001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK007',
        vendorPartNumber: 'STORAGE001',
        vendorName: 'NetApp',
        description: 'NetApp FAS2750 Storage System',
        productCategory: 'Storage',
        productSubcategory: 'Network Storage',
        productClass: 'Storage',
        upc: '123456789018',
        vendorNumber: 'NETAPP001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      },
      {
        ingramPartNumber: 'MOCK008',
        vendorPartNumber: 'SECURITY001',
        vendorName: 'Fortinet',
        description: 'Fortinet FortiGate 100F Firewall',
        productCategory: 'Security',
        productSubcategory: 'Firewalls',
        productClass: 'Security Appliance',
        upc: '123456789019',
        vendorNumber: 'FORTINET001',
        productAuthorized: 'True',
        productStatusCode: 'Active'
      }
    ];

    // Filter products based on search parameters
    let filteredProducts = mockProducts;
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.description.toLowerCase().includes(keyword) ||
        product.vendorName.toLowerCase().includes(keyword) ||
        product.ingramPartNumber.toLowerCase().includes(keyword)
      );
    }

    if (params.category) {
      filteredProducts = filteredProducts.filter(product => 
        product.productCategory?.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.brand) {
      filteredProducts = filteredProducts.filter(product => 
        product.vendorName?.toLowerCase() === params.brand?.toLowerCase()
      );
    }

    // Pagination
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      catalog: paginatedProducts,
      recordsFound: filteredProducts.length,
      pageNumber,
      pageSize,
      totalPages: Math.ceil(filteredProducts.length / pageSize)
    };
  }

  async getProductDetails(ingramPartNumber: string): Promise<Product> {
    // Check if we have the required environment variables
    if (!process.env.INGRAM_CLIENT_ID || !process.env.INGRAM_CLIENT_SECRET) {
      console.warn('Ingram Micro API credentials not configured. Using mock data.');
      return this.getMockProductDetails(ingramPartNumber);
    }

    try {
      const endpoint = `/resellers/v6/catalog/details/${ingramPartNumber}`;
      return apiClient.get<Product>(endpoint);
    } catch (error) {
      console.warn('Ingram Micro API error. Using mock data:', error);
      return this.getMockProductDetails(ingramPartNumber);
    }
  }

  private getMockProductDetails(ingramPartNumber: string): Product {
    // Get mock products and find the one with matching part number
    const mockResponse = this.getMockProducts({});
    const product = mockResponse.catalog.find(p => p.ingramPartNumber === ingramPartNumber);
    
    if (product) {
      return product;
    }

    // Return a default mock product if not found
    return {
      ingramPartNumber,
      vendorPartNumber: 'UNKNOWN',
      vendorName: 'Unknown Vendor',
      description: 'Product details not available',
      productCategory: 'Unknown',
      productSubcategory: 'Unknown',
      productClass: 'Unknown',
      upc: '000000000000',
      vendorNumber: 'UNKNOWN',
      productAuthorized: 'True',
      productStatusCode: 'Active'
    };
  }

  async getPriceAndAvailability(
    request: PriceAvailabilityRequest
  ): Promise<PriceAvailabilityResponse> {
    // Check if we have the required environment variables
    if (!process.env.INGRAM_CLIENT_ID || !process.env.INGRAM_CLIENT_SECRET) {
      console.warn('Ingram Micro API credentials not configured. Using mock data.');
      return this.getMockPriceAndAvailability(request);
    }

    try {
      const endpoint = '/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true';
      const data = await apiClient.post<PriceAvailabilityResponse>(endpoint, request);
      
      // Check if any products have error status codes
      const hasErrors = data.some((product: any) => 
        product.productStatusCode === 'E' || product.errorCode
      );
      
      if (hasErrors) {
        console.warn('Ingram Micro API returned errors for some products. Using mock data.');
        return this.getMockPriceAndAvailability(request);
      }
      
      return data;
    } catch (error) {
      console.warn('Ingram Micro API error. Using mock data:', error);
      return this.getMockPriceAndAvailability(request);
    }
  }

  private getMockPriceAndAvailability(request: PriceAvailabilityRequest): PriceAvailabilityResponse {
    // Generate mock pricing data - PriceAvailabilityResponse is an array
    const mockPricing = request.products?.map((product, index) => ({
      index,
      productStatusCode: 'Active',
      productStatusMessage: 'Product is available',
      ingramPartNumber: product.ingramPartNumber,
      vendorPartNumber: 'MOCK',
      upc: '123456789012',
      errorCode: '',
      pricing: {
        retailPrice: Math.floor(Math.random() * 2000) + 100,
        mapPrice: Math.floor(Math.random() * 1500) + 80,
        customerPrice: Math.floor(Math.random() * 1200) + 60,
        currencyCode: 'USD'
      },
      availability: {
        available: Math.random() > 0.3, // 70% chance of being available
        totalAvailability: Math.floor(Math.random() * 100) + 1,
        availabilityByWarehouse: [
          {
            warehouseId: 'WH001',
            quantityAvailable: Math.floor(Math.random() * 50) + 1,
            location: 'Main Warehouse',
            quantityBackordered: 0,
            quantityBackorderedEta: '',
            quantityOnOrder: 0
          }
        ]
      },
      discounts: [],
      subscriptionPrice: []
    })) || [];

    return mockPricing as PriceAvailabilityResponse;
  }

  async getProductsByCategory(category: string, pageNumber = 1, pageSize = 20): Promise<ProductSearchResponse> {
    return this.searchProducts({
      category,
      pageNumber,
      pageSize,
    });
  }

  async getProductsByBrand(brand: string, pageNumber = 1, pageSize = 20): Promise<ProductSearchResponse> {
    return this.searchProducts({
      brand,
      pageNumber,
      pageSize,
    });
  }

  async searchProductsByKeyword(
    keyword: string,
    pageNumber = 1,
    pageSize = 20
  ): Promise<ProductSearchResponse> {
    return this.searchProducts({
      keyword,
      pageNumber,
      pageSize,
    });
  }
}

export const productsApi = new ProductsApi();
