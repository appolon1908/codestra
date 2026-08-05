import { base_url } from "./base";

export type FeatureState = Record<string, boolean>;
export type Asset = { id: string; symbol: string; name: string; decimals: number };
export type Network = { id: string; code: string; name: string };
export type AssetNetwork = { id: string; asset_id: string; network_id: string; symbol: string; network: string; confirmations_required: number };
export type Wallet = { id: string; tenant_id: string; owner_id: string; status: string };
export type Balance = {
  id: string; wallet_id: string; asset: Asset; network: Network;
  posted_atomic: string; pending_credit_atomic: string; held_atomic: string;
  reserved_atomic: string; available_atomic: string;
};
export type ProblemDetails = { type: string; title: string; status: number; detail: string; code: string; request_id?: string; errors?: unknown[] };

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((response) => response.data);

/** Typed client generated from contracts/openapi/codestra-real-wallet-v1.yaml.
 * Value-changing operations deliberately remain explicit and return the
 * server's FEATURE_DISABLED problem until an approved activation exists.
 */
export const realWalletClient = {
  features: () => unwrap<{ features: FeatureState }>(base_url.get("/api/v1/features/")),
  status: () => unwrap<{ enabled: boolean; mode: string; demo_isolation: boolean }>(base_url.get("/api/v1/status/")),
  assets: () => unwrap<{ results: Asset[] }>(base_url.get("/api/v1/assets/")),
  networks: () => unwrap<{ results: Network[] }>(base_url.get("/api/v1/networks/")),
  assetNetworks: () => unwrap<{ results: AssetNetwork[] }>(base_url.get("/api/v1/asset-networks/")),
  wallets: () => unwrap<{ results: Wallet[] }>(base_url.get("/api/v1/wallets/")),
  wallet: (walletId: string) => unwrap<Wallet>(base_url.get(`/api/v1/wallets/${encodeURIComponent(walletId)}/`)),
  balances: (walletId: string) => unwrap<{ results: Balance[] }>(base_url.get(`/api/v1/wallets/${encodeURIComponent(walletId)}/balances/`)),
  addresses: (walletId: string) => unwrap<{ results: Array<Record<string, unknown>> }>(base_url.get(`/api/v1/wallets/${encodeURIComponent(walletId)}/addresses/`)),
  deposits: () => unwrap<{ results: Array<Record<string, unknown>> }>(base_url.get("/api/v1/deposits/")),
  withdrawals: () => unwrap<{ results: Array<Record<string, unknown>> }>(base_url.get("/api/v1/withdrawals/")),
  webhookSubscriptions: () => unwrap<{ results: Array<Record<string, unknown>> }>(base_url.get("/api/v1/webhook-subscriptions/")),
  createWebhookSubscription: (payload: { endpoint: string; description?: string }) => unwrap<Record<string, unknown>>(base_url.post("/api/v1/webhook-subscriptions/", payload)),
  rotateWebhookSecret: (subscriptionId: string) => unwrap<Record<string, unknown>>(base_url.post(`/api/v1/webhook-subscriptions/${encodeURIComponent(subscriptionId)}/rotate-secret/`)),
};

export const realWalletDisabledOperations = {
  createWallet: "/api/v1/wallets/",
  createDepositAddress: "/api/v1/wallets/{wallet_id}/addresses/",
  createWithdrawal: "/api/v1/withdrawals/",
  createTransfer: "/api/v1/transfers/",
  createTradingOrder: "/api/v1/trading/orders/",
} as const;
