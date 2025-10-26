"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import {
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  ExternalLink,
  Heart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Product, PriceAvailabilityResponse } from "@/lib/types";

const PRODUCT_PLACEHOLDER = "/images/product-placeholder.svg";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showQuickView?: boolean;
  priceAvailabilityData?: any;
  priceLoading?: boolean;
  isInCompare?: boolean;
  onToggleCompare?: () => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  showQuickView = true,
  priceAvailabilityData,
  priceLoading = false,
  isInCompare = false,
  onToggleCompare,
}: ProductCardProps) {
  const productTitle =
    product.description?.trim() ||
    product.vendorPartNumber ||
    product.ingramPartNumber;
  const vendorLabel = product.vendorName || "Unknown Vendor";
  const productImage = useMemo(() => {
    const mediaLink = product.links?.find((link) => {
      const topic = link.topic?.toLowerCase() ?? "";
      const type = link.type?.toLowerCase() ?? "";
      const href = link.href?.toLowerCase() ?? "";
      return (
        topic.includes("image") ||
        type.includes("image") ||
        href.endsWith(".png") ||
        href.endsWith(".jpg") ||
        href.endsWith(".jpeg") ||
        href.endsWith(".webp")
      );
    });
    return mediaLink?.href || PRODUCT_PLACEHOLDER;
  }, [product]);
  const isRemoteImage = productImage.startsWith("http");
  // Get price/availability data for this specific product
  const productPriceAvailability = Array.isArray(priceAvailabilityData)
    ? priceAvailabilityData.find(
        (item: any) => item.ingramPartNumber === product.ingramPartNumber,
      )
    : null;
  const pricing = productPriceAvailability?.pricing;
  const primaryPrice =
    pricing?.customerPrice ?? pricing?.retailPrice ?? pricing?.mapPrice;
  const currencyCode = pricing?.currencyCode ?? "USD";
  const formattedPrice =
    typeof primaryPrice === "number"
      ? formatCurrency(primaryPrice, currencyCode)
      : null;
  const availability = productPriceAvailability?.availability;
  const isAvailable = availability?.available;
  const availabilityCount = availability?.totalAvailability ?? 0;
  const disableAddToCart =
    product.authorizedToPurchase === "False" ||
    (availability && !availability.available);

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">
        <Image
          src={productImage}
          alt={productTitle}
          fill
          sizes="(min-width: 1024px) 320px, 100vw"
          unoptimized={isRemoteImage}
          className="object-contain object-center p-6 transition duration-300 group-hover:scale-[1.03]"
        />
        {/*{onToggleCompare && (
          <button
            type="button"
            onClick={onToggleCompare}
            aria-pressed={isInCompare}
            aria-label={
              isInCompare
                ? "Remove product from saved list"
                : "Save product for later"
            }
            className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition ${
              isInCompare
                ? "border-[#062fa3] bg-[#062fa3] text-white shadow-lg"
                : "border-white/70 bg-white/90 text-gray-700 shadow-sm hover:border-[#062fa3]/70 hover:text-[#062fa3]"
            }`}
          >
            <Heart
              className="h-3.5 w-3.5"
              fill={isInCompare ? "currentColor" : "transparent"}
              strokeWidth={1.5}
            />
            <span>{isInCompare ? "Saved" : "Save"}</span>
          </button>
        )}*/}
        <div className="pointer-events-none absolute inset-0 border border-white/60" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            {vendorLabel}
          </span>
          <h3 className="text-lg font-semibold text-gray-900">
            <span className="line-clamp-2 leading-tight">{productTitle}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-mono text-gray-700">
              {product.ingramPartNumber}
            </span>
            {product.vendorPartNumber && (
              <>
                <span className="text-gray-300">•</span>
                <span className="truncate">{product.vendorPartNumber}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.newProduct === "True" && (
              <Badge
                variant="success"
                className="text-xs font-semibold text-emerald-600"
              >
                New arrival
              </Badge>
            )}
            {product.directShip === "True" && (
              <Badge
                variant="info"
                className="text-xs font-semibold text-[#062fa3]"
              >
                Direct ship
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="min-h-[3.5rem] rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            {priceLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                <span>Loading price...</span>
              </div>
            ) : formattedPrice ? (
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formattedPrice}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {currencyCode}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                  Price on request
                </span>
              </div>
            )}
          </div>

          <div className="min-h-[2rem] rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            {priceLoading ? (
              <p className="text-sm text-gray-500">Checking availability...</p>
            ) : availability ? (
              isAvailable ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>In stock</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    {availabilityCount} units
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Out of stock</span>
                </div>
              )
            ) : (
              <p className="text-sm text-gray-600">
                Check availability for pricing
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {showQuickView && (
            <Button
              onClick={handleViewDetails}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#062fa3] px-5 py-3 font-medium text-white shadow-md transition hover:bg-[#062fa3]/90"
            >
              <ExternalLink className="h-4 w-4" />
              View Product
            </Button>
          )}

          <Button
            onClick={() => onAddToCart?.(product)}
            disabled={disableAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 font-medium text-white shadow-md transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <ShoppingCart className="h-4 w-4" />
            {priceLoading
              ? "Loading..."
              : product.authorizedToPurchase === "False"
                ? "Not Authorized"
                : availability && !availability.available
                  ? "Out of Stock"
                  : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
