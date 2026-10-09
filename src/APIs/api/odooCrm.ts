import { base_url } from "@/APIs/base";
import {
  ODOO_CRM_OVERVIEW_ENDPOINT,
  ODOO_CRM_CAMPAIGNS_ENDPOINT,
  ODOO_CRM_LEADS_ENDPOINT,
} from "@/APIs/endpoints";

export type Campaign = {
  id: number;
  code: string;
  name: string;
  state: string;
  active: boolean;
  campaign_type: string;
};
export type Lead = {
  id: number;
  name: string;
  campaign_id: number;
  queue_state: string;
  priority: string;
  assigned_to_me: boolean;
};
export type Portfolio = {
  schema_version: number;
  role: string;
  total: number;
  page: number;
  limit: number;
  campaigns: Campaign[];
};
export type LeadPortfolio = {
  schema_version: number;
  role: string;
  total: number;
  page: number;
  limit: number;
  leads: Lead[];
};
export type Overview = Portfolio & { ok: true; lead_count_visible: number; service: string };

export async function getCRMOverview(): Promise<Overview> {
  const { data } = await base_url.get<Overview>(ODOO_CRM_OVERVIEW_ENDPOINT);
  if (data.schema_version !== 1 || !Array.isArray(data.campaigns)) throw new Error("Unsupported Odoo CRM API response");
  return data;
}

export async function getCRMCampaigns(page = 1): Promise<Portfolio> {
  const { data } = await base_url.get<Portfolio>(ODOO_CRM_CAMPAIGNS_ENDPOINT, {
    params: { page, limit: 25 },
  });
  if (data.schema_version !== 1 || !Array.isArray(data.campaigns)) throw new Error("Unsupported Odoo campaigns API response");
  return data;
}

export async function getCRMLeads(page = 1, campaignId?: number): Promise<LeadPortfolio> {
  const { data } = await base_url.get<LeadPortfolio>(ODOO_CRM_LEADS_ENDPOINT, {
    params: { page, limit: 25, ...(campaignId ? { campaign_id: campaignId } : {}) },
  });
  if (data.schema_version !== 1 || !Array.isArray(data.leads)) throw new Error("Unsupported Odoo leads API response");
  return data;
}
