import { productsApi } from '../../../../lib/api/ingram/products';
import { NextRequest, NextResponse } from 'next/server';
import type { Product, ProductSearchRequest } from '../../../../lib/types';

const DISCONTINUED_STATUS_CODES = new Set([
  'D',
  'DC',
  'DISC',
  'DISCONTINUED',
  'EOL',
  'END',
  'INACTIVE',
]);

const BUFFER_PAGES = 1;

const isDiscontinuedProduct = (product: Product): boolean => {
  const discontinuedFlag = (product.discontinued || '').trim().toLowerCase();
  if (discontinuedFlag === 'true' || discontinuedFlag === 'yes') {
    return true;
  }

  const statusCode = (product.productStatusCode || '').trim().toUpperCase();
  if (!statusCode) {
    return false;
  }

  if (DISCONTINUED_STATUS_CODES.has(statusCode)) {
    return true;
  }

  return statusCode.includes('DISC') || statusCode.includes('EOL');
};

const filterActiveCatalog = (catalog: Product[] = []): Product[] => {
  return catalog.filter((product) => !isDiscontinuedProduct(product));
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchParams_obj: ProductSearchRequest = {
      keyword: searchParams.get('keyword') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      pageNumber: parseInt(searchParams.get('pageNumber') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      sortBy: (searchParams.get('sortBy') as 'price' | 'name' | 'popularity') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
      productStatuses: searchParams.get('productStatuses') || 'ACTIVE',
    };

    // Remove undefined values and convert to proper format
    const cleanParams = Object.fromEntries(
      Object.entries(searchParams_obj).filter(([_, value]) => value !== undefined && value !== null)
    ) as ProductSearchRequest;

    const requestedPageNumber = Math.max(1, cleanParams.pageNumber ?? 1);
    const requestedPageSize = Math.max(1, cleanParams.pageSize ?? 20);
    const { pageNumber: _ignoredPageNumber, ...baseParams } = cleanParams;

    const pagedActiveProducts: Product[] = [];
    let currentApiPage = 1;
    let upstreamTotalPages: number | null = null;
    let upstreamPageSize = requestedPageSize;
    let lastRecordsFound: number | null = null;

    const requiredActiveCount = (requestedPageNumber + BUFFER_PAGES) * requestedPageSize;

    while (true) {
      let pageData;
      try {
        pageData = await productsApi.searchProducts({
          ...baseParams,
          pageNumber: currentApiPage,
          pageSize: requestedPageSize,
        });
      } catch (apiError) {
        console.warn('Ingram Micro API failed, using fallback:', apiError);
        return NextResponse.json({
          catalog: [],
          recordsFound: 0,
          pageNumber: 1,
          pageSize: requestedPageSize,
          totalPages: 0,
        });
      }

      lastRecordsFound = lastRecordsFound ?? (pageData.recordsFound ?? null);
      upstreamPageSize = pageData.pageSize || upstreamPageSize;

      if (pageData.totalPages !== undefined && pageData.totalPages !== null) {
        upstreamTotalPages = pageData.totalPages;
      } else if (pageData.recordsFound !== undefined && pageData.recordsFound !== null) {
        upstreamTotalPages = Math.ceil(
          Math.max(0, pageData.recordsFound) / Math.max(1, pageData.pageSize || upstreamPageSize)
        );
      }

      const filtered = filterActiveCatalog(pageData.catalog);
      pagedActiveProducts.push(...filtered);

      const processedAllPages =
        upstreamTotalPages !== null && currentApiPage >= upstreamTotalPages;
      const hasEnoughForBufferedPage = pagedActiveProducts.length >= requiredActiveCount;

      if (processedAllPages || hasEnoughForBufferedPage) {
        break;
      }

      currentApiPage += 1;

      if (upstreamTotalPages !== null && currentApiPage > upstreamTotalPages) {
        break;
      }
    }

    const processedEntireCatalog =
      upstreamTotalPages !== null && currentApiPage >= upstreamTotalPages;

    const totalActiveKnown = pagedActiveProducts.length;
    const minimalPages = Math.ceil(totalActiveKnown / requestedPageSize);
    const effectiveTotalPages = processedEntireCatalog
      ? minimalPages
      : Math.max(minimalPages, requestedPageNumber + BUFFER_PAGES);

    const safeTotalPages = Math.max(0, effectiveTotalPages);
    const safePageNumber =
      safeTotalPages === 0
        ? 1
        : Math.min(requestedPageNumber, safeTotalPages);

    const startIndex = (safePageNumber - 1) * requestedPageSize;
    const pageCatalog =
      safeTotalPages === 0
        ? []
        : pagedActiveProducts.slice(startIndex, startIndex + requestedPageSize);

    const recordsFound = processedEntireCatalog
      ? totalActiveKnown
      : safeTotalPages * requestedPageSize;

    return NextResponse.json({
      catalog: pageCatalog,
      recordsFound,
      pageNumber: safePageNumber,
      pageSize: requestedPageSize,
      totalPages: safeTotalPages,
      hasMore: !processedEntireCatalog && safeTotalPages > requestedPageNumber,
      upstream: {
        totalPages: upstreamTotalPages,
        recordsFound: lastRecordsFound,
      },
    });
  } catch (error) {
    console.error('Product search error:', error);
    // Return empty results instead of 500 error
    return NextResponse.json({
      catalog: [],
      recordsFound: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
