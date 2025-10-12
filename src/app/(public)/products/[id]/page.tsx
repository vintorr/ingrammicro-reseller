'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/formatters';
import { useCart } from '@/lib/hooks/useCart';
import type { Product, PriceAvailabilityResponse } from '@/lib/types';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [priceAvailability, setPriceAvailability] = useState<PriceAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);


  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ingram/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setProduct(getMockProductDetails(productId));
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setProduct(getMockProductDetails(productId));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchPriceAndAvailability = useCallback(async () => {
    setPriceLoading(true);
    
    try {
      const response = await fetch('/api/ingram/price-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [{ ingramPartNumber: productId }]
        }),
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        setPriceAvailability(getMockPriceAvailability(productId));
        return;
      }
      
      const data = await response.json();
      const productsData = Array.isArray(data) ? data : (data.products || []);
      const productData = productsData.find((item: any) => item.ingramPartNumber === productId);
      
      if (productData) {
        setPriceAvailability(productData);
      } else {
        setPriceAvailability(getMockPriceAvailability(productId));
      }
    } catch (err) {
      console.error('Error fetching price and availability:', err);
      setPriceAvailability(getMockPriceAvailability(productId));
    } finally {
      setPriceLoading(false);
    }
  }, [productId]);

  // Mock data functions
  const getMockProductDetails = (id: string): Product => {
    return {
      ingramPartNumber: id,
      vendorPartNumber: 'MOCK-' + id,
      productAuthorized: 'True',
      description: 'Sample Product - ' + id,
      upc: '123456789012',
      productCategory: 'Computer Systems',
      productSubcategory: 'Portable Computers',
      vendorName: 'Sample Vendor',
      vendorNumber: '1234',
      productStatusCode: 'Active',
      productClass: 'V',
      newProduct: 'True',
      directShip: 'True',
      discontinued: 'False',
      authorizedToPurchase: 'True',
      hasWarranty: 'True'
    };
  };

  const getMockPriceAvailability = (id: string) => {
    return [{
      index: 0,
      productStatusCode: 'Active',
      productStatusMessage: 'Product is available',
      ingramPartNumber: id,
      vendorPartNumber: 'MOCK-' + id,
      upc: '123456789012',
      errorCode: '',
      pricing: {
        retailPrice: Math.floor(Math.random() * 2000) + 100,
        mapPrice: Math.floor(Math.random() * 1500) + 80,
        customerPrice: Math.floor(Math.random() * 1200) + 60,
        currencyCode: 'USD'
      },
      availability: {
        available: true,
        totalAvailability: Math.floor(Math.random() * 100) + 1,
        availabilityByWarehouse: [
          {
            warehouseId: 'WH001',
            quantityAvailable: Math.floor(Math.random() * 50) + 1,
            location: 'US Warehouse',
            quantityBackordered: 0,
            quantityBackorderedEta: '',
            quantityOnOrder: 0
          }
        ]
      },
      discounts: [],
      subscriptionPrice: []
    }];
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchPriceAndAvailability();
    }
  }, [productId, fetchProductDetails, fetchPriceAndAvailability]);

  const handleAddToCart = () => {
    if (!product || !priceAvailability) return;
    
    const productData = Array.isArray(priceAvailability) ? priceAvailability[0] : priceAvailability;
    
    if (productData?.pricing && productData?.availability?.available) {
      const cartItem = {
        product,
        quantity,
        unitPrice: productData.pricing.customerPrice,
        totalPrice: productData.pricing.customerPrice * quantity,
      };
      addToCart(cartItem);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const productData = Array.isArray(priceAvailability) ? priceAvailability[0] : priceAvailability;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="w-16 h-16 text-gray-500" />
                </div>
                <p className="text-gray-500">Product Image</p>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gray-100 rounded-lg cursor-pointer border-2 ${
                    selectedImage === index - 1 ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(index - 1)}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{index}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info">{product.vendorName}</Badge>
                {product.newProduct === 'True' && <Badge variant="success">New</Badge>}
                {product.directShip === 'True' && <Badge variant="info">Direct Ship</Badge>}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.description}
              </h1>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">SKU:</span> {product.ingramPartNumber}</p>
                <p><span className="font-medium">UPC:</span> {product.upc}</p>
                <p><span className="font-medium">Category:</span> {product.productCategory}</p>
                <p><span className="font-medium">Subcategory:</span> {product.productSubcategory}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              {priceLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-600">Loading pricing...</span>
                </div>
              ) : productData?.pricing ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-green-600">
                      {formatCurrency(productData.pricing.customerPrice, productData.pricing.currencyCode)}
                    </span>
                    {productData.pricing.retailPrice > productData.pricing.customerPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(productData.pricing.retailPrice, productData.pricing.currencyCode)}
                      </span>
                    )}
                  </div>
                  
                  {productData.pricing.retailPrice > productData.pricing.customerPrice && (
                    <p className="text-sm text-green-600 font-medium">
                      Save {formatCurrency(productData.pricing.retailPrice - productData.pricing.customerPrice, productData.pricing.currencyCode)}!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Price available on request</p>
              )}
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              {priceLoading ? (
                <p className="text-gray-600">Checking availability...</p>
              ) : productData?.availability ? (
                <div className="flex items-center gap-3">
                  {productData.availability.available ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="text-green-600 font-semibold">
                          In Stock ({productData.availability.totalAvailability} available)
                        </p>
                        <p className="text-sm text-gray-600">
                          Ships from {productData.availability.availabilityByWarehouse[0]?.location}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <p className="text-red-600 font-semibold">Out of Stock</p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Check availability for pricing</p>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-r-none border-r border-gray-300"
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-16 text-center py-2">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-l-none border-l border-gray-300"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!productData?.availability?.available}
                  className="w-full py-3 text-lg font-semibold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Fast Shipping</p>
                <p className="text-xs text-gray-600">1-2 business days</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure</p>
                <p className="text-xs text-gray-600">SSL encrypted</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Returns</p>
                <p className="text-xs text-gray-600">30 day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
