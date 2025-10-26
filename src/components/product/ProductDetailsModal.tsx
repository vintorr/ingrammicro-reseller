"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ExternalLink,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { Product, PriceAvailabilityResponse } from "../../lib/types";

interface ProductDetailsModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductDetailsModal({
  productId,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [priceAvailability, setPriceAvailability] =
    useState<PriceAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock product details for fallback
  const getMockProductDetails = (id: string): Product => {
    return {
      ingramPartNumber: id,
      vendorPartNumber: "MOCK-" + id,
      productAuthorized: "True",
      description: "Sample Product - " + id,
      upc: "123456789012",
      productCategory: "Computer Systems",
      productSubcategory: "Portable Computers",
      vendorName: "Sample Vendor",
      vendorNumber: "1234",
      productStatusCode: "Active",
      productClass: "V",
      newProduct: "True",
      directShip: "True",
      discontinued: "False",
      authorizedToPurchase: "True",
      hasWarranty: "True",
    };
  };

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching product details for:", productId);

      const response = await fetch(`/api/ingram/products/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.log("Product not found in API, using mock data");
        setProduct(getMockProductDetails(productId));
        return;
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setProduct(getMockProductDetails(productId));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchPriceAndAvailability = useCallback(async () => {
    setPriceLoading(true);

    try {
      const response = await fetch("/api/ingram/price-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: [{ ingramPartNumber: productId }],
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        setPriceAvailability(getMockPriceAvailability(productId));
        return;
      }

      const data = await response.json();
      setPriceAvailability(data.products || data);
    } catch (err) {
      console.error("Error fetching price and availability:", err);
      setPriceAvailability(getMockPriceAvailability(productId));
    } finally {
      setPriceLoading(false);
    }
  }, [productId]);

  // Mock price and availability data for fallback
  const getMockPriceAvailability = (id: string) => {
    return [
      {
        index: 0,
        productStatusCode: "Active",
        productStatusMessage: "Product is available",
        ingramPartNumber: id,
        vendorPartNumber: "MOCK-" + id,
        upc: "123456789012",
        errorCode: "",
        pricing: {
          retailPrice: Math.floor(Math.random() * 2000) + 100,
          mapPrice: Math.floor(Math.random() * 1500) + 80,
          customerPrice: Math.floor(Math.random() * 1200) + 60,
          currencyCode: "USD",
        },
        availability: {
          available: true,
          totalAvailability: Math.floor(Math.random() * 100) + 1,
          availabilityByWarehouse: [
            {
              warehouseId: "WH001",
              quantityAvailable: Math.floor(Math.random() * 50) + 1,
              location: "US Warehouse",
              quantityBackordered: 0,
              quantityBackorderedEta: "",
              quantityOnOrder: 0,
            },
          ],
        },
        discounts: [],
        subscriptionPrice: [],
      },
    ];
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
      fetchPriceAndAvailability();
    }
  }, [isOpen, productId, fetchProductDetails, fetchPriceAndAvailability]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (product && onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewProduct = () => {
    // Navigate to full product page
    window.open(`/products/${productId}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop with blur effect */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal with glass effect */}
        <div className="relative w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-gray-900">
              Product Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600 text-lg">
                  Loading product details...
                </span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <AlertCircle className="mx-auto h-16 w-16" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Product
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-x-4">
                  <Button
                    onClick={fetchProductDetails}
                    className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-6 py-3 rounded-xl"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={onClose}
                    className="bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 px-6 py-3 rounded-xl"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {product && (
              <div className="space-y-8">
                {/* Product Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      {product.description}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="bg-gray-100/80 px-3 py-1 rounded-lg text-sm font-mono">
                        SKU: {product.ingramPartNumber}
                      </span>
                      <span className="text-lg">
                        Brand: {product.vendorName}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-2">
                    {product.productAuthorized === "True" && (
                      <Badge className="bg-green-100/80 text-green-700 border-green-200/50">
                        Authorized
                      </Badge>
                    )}
                    {product.productStatusCode && (
                      <Badge className="bg-blue-100/80 text-blue-700 border-blue-200/50">
                        Status: {product.productStatusCode}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Details Table */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    Product Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Category:
                        </span>
                        <span className="text-gray-900">
                          {product.productCategory || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Subcategory:
                        </span>
                        <span className="text-gray-900">
                          {product.productSubcategory || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Product Class:
                        </span>
                        <span className="text-gray-900">
                          {product.productClass || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          UPC Code:
                        </span>
                        <span className="text-gray-900 font-mono text-sm">
                          {product.upc || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Vendor Part Number:
                        </span>
                        <span className="text-gray-900 font-mono text-sm">
                          {product.vendorPartNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Vendor Number:
                        </span>
                        <span className="text-gray-900">
                          {product.vendorNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Product Authorized:
                        </span>
                        <span className="text-gray-900">
                          {product.productAuthorized === "True" ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Product Status:
                        </span>
                        <span className="text-gray-900">
                          {product.productStatusCode || "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Direct Ship:
                        </span>
                        <span className="text-gray-900">
                          {product.directShip === "True" ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Discontinued:
                        </span>
                        <span className="text-gray-900">
                          {product.discontinued === "True" ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Availability */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    Pricing & Availability
                    {priceLoading && <LoadingSpinner size="sm" />}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-medium text-gray-700 mb-3">
                        Price
                      </h5>
                      {priceLoading ? (
                        <p className="text-gray-500">Loading price...</p>
                      ) : priceAvailability &&
                        priceAvailability.length > 0 &&
                        priceAvailability[0]?.pricing ? (
                        <div className="space-y-2">
                          <div className="text-3xl font-bold text-gray-900">
                            ${priceAvailability[0].pricing.customerPrice}{" "}
                            {priceAvailability[0].pricing.currencyCode}
                          </div>
                          {/*{priceAvailability[0].pricing.retailPrice > priceAvailability[0].pricing.customerPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              Retail: ${priceAvailability[0].pricing.retailPrice} {priceAvailability[0].pricing.currencyCode}
                            </div>
                          )}*/}
                          {priceAvailability[0].pricing.mapPrice && (
                            <div className="text-sm text-blue-600">
                              MAP: ${priceAvailability[0].pricing.mapPrice}{" "}
                              {priceAvailability[0].pricing.currencyCode}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          Price available on request
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-lg font-medium text-gray-700 mb-3">
                        Availability
                      </h5>
                      {priceLoading ? (
                        <p className="text-gray-500">
                          Checking availability...
                        </p>
                      ) : priceAvailability &&
                        priceAvailability.length > 0 &&
                        priceAvailability[0]?.availability ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {priceAvailability[0].availability.available ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-green-600 font-medium text-lg">
                                  In Stock (
                                  {
                                    priceAvailability[0].availability
                                      .totalAvailability
                                  }{" "}
                                  units)
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-red-600 font-medium text-lg">
                                  Out of Stock
                                </span>
                              </>
                            )}
                          </div>
                          {priceAvailability[0].availability
                            .availabilityByWarehouse &&
                            priceAvailability[0].availability
                              .availabilityByWarehouse.length > 0 && (
                              <div className="ml-7 space-y-1">
                                <p className="text-xs font-medium text-gray-500">
                                  Warehouse Locations:
                                </p>
                                {priceAvailability[0].availability.availabilityByWarehouse.map(
                                  (warehouse: any, index: number) => (
                                    <div
                                      key={index}
                                      className="text-xs text-gray-600"
                                    >
                                      {warehouse.location}:{" "}
                                      {warehouse.quantityAvailable} units
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          Check availability for pricing
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/20">
                  <Button
                    onClick={handleViewProduct}
                    className="flex items-center gap-2 bg-[#062fa3] hover:bg-[#062fa3]/90 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Product
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={
                      product.productAuthorized === "False" ||
                      (priceAvailability?.[0]?.availability &&
                        !priceAvailability[0].availability.available)
                    }
                    className="flex items-center gap-2 bg-gray-900/90 hover:bg-gray-800/90 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {priceLoading ? "Loading..." : "Add to Cart"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
