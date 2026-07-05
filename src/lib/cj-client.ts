// Real CJ Dropshipping API client (server-only — do not import from client components).
//
// Docs used to build this (verified live, July 2026):
//   Auth:    https://developers.cjdropshipping.cn/en/api/api2/api/auth.html
//   Product: https://developers.cjdropshipping.cn/en/api/api2/api/product.html
//
// Setup: create an API Key at https://www.cjdropshipping.com/my.html#/authorize/API
// and set CJ_DROPSHIPPING_API_KEY in your environment.
//
// Auth rate limit is 1 request/second (QPS = 1). The token is cached in-memory
// per server instance below, which is fine for low-traffic admin use (this client
// is only meant to be called from the /admin/curate tooling, not on every page
// load). If you later call this on every user request, persist the token in
// Supabase instead of memory so serverless cold starts don't re-auth constantly.

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

type CjAuthResponse = {
  code: number;
  result: boolean;
  message: string;
  data: {
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
  } | null;
};

type CjTokenCache = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

let tokenCache: CjTokenCache | null = null;
let lastAuthCallAt = 0;

export type CjProduct = {
  id: string;
  nameEn: string;
  sku: string;
  bigImage: string;
  sellPrice: string;
  nowPrice: string;
  listedNum: number;
  categoryId: string;
  threeCategoryName?: string;
  twoCategoryName?: string;
  oneCategoryName?: string;
  addMarkStatus: number;
  warehouseInventoryNum: number;
  totalVerifiedInventory: number;
  deliveryCycle?: string;
  createAt: number;
};

export type CjSearchParams = {
  keyWord?: string;
  page?: number;
  size?: number;
  categoryId?: string;
  countryCode?: string;
  /** 0 = Trending products, 1 = New products, 2 = Video products, 3 = Slow-moving products */
  productFlag?: 0 | 1 | 2 | 3;
  sort?: "asc" | "desc";
  /** 0=best match, 1=listing count, 2=sell price, 3=create time, 4=inventory */
  orderBy?: 0 | 1 | 2 | 3 | 4;
};

function getApiKey() {
  const key = process.env.CJ_DROPSHIPPING_API_KEY;
  if (!key) {
    throw new Error(
      "CJ_DROPSHIPPING_API_KEY is not set. Get an API key at https://www.cjdropshipping.com/my.html#/authorize/API and add it to your environment."
    );
  }
  return key;
}

async function throttleAuthCall() {
  const elapsed = Date.now() - lastAuthCallAt;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastAuthCallAt = Date.now();
}

async function requestNewToken(): Promise<CjTokenCache> {
  await throttleAuthCall();

  const response = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: getApiKey() })
  });

  const payload = (await response.json()) as CjAuthResponse;

  if (!response.ok || !payload.result || !payload.data) {
    throw new Error(`CJ Dropshipping auth failed: ${payload.message || response.statusText}`);
  }

  return {
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
    expiresAt: new Date(payload.data.accessTokenExpiryDate).getTime()
  };
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const safetyBufferMs = 5 * 60_000;

  if (tokenCache && tokenCache.expiresAt - safetyBufferMs > now) {
    return tokenCache.accessToken;
  }

  tokenCache = await requestNewToken();
  return tokenCache.accessToken;
}

/**
 * Search CJ Dropshipping's live catalog. Supports the same "trending products"
 * flag CJ itself uses internally (productFlag: 0), which is a genuine
 * platform-reported signal, not something we invented.
 */
export async function searchCjProducts(params: CjSearchParams): Promise<{
  products: CjProduct[];
  totalRecords: number;
  page: number;
}> {
  const token = await getAccessToken();

  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("size", String(Math.min(params.size ?? 20, 100)));
  if (params.keyWord) query.set("keyWord", params.keyWord);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.countryCode) query.set("countryCode", params.countryCode);
  if (params.productFlag !== undefined) query.set("productFlag", String(params.productFlag));
  if (params.sort) query.set("sort", params.sort);
  if (params.orderBy !== undefined) query.set("orderBy", String(params.orderBy));
  query.set("features", "enable_category");

  const response = await fetch(`${CJ_BASE_URL}/product/listV2?${query.toString()}`, {
    method: "GET",
    headers: { "CJ-Access-Token": token }
  });

  const payload = await response.json();

  if (!response.ok || !payload.result) {
    throw new Error(`CJ product search failed: ${payload.message || response.statusText}`);
  }

  const rawGroups: Array<{ productList: CjProduct[] }> = payload.data?.content ?? [];
  const products = rawGroups.flatMap((group) => group.productList ?? []);

  return {
    products,
    totalRecords: payload.data?.totalRecords ?? products.length,
    page: payload.data?.pageNumber ?? params.page ?? 1
  };
}

export function isCjConfigured() {
  return Boolean(process.env.CJ_DROPSHIPPING_API_KEY);
}
