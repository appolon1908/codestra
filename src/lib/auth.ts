import { base_url } from "@/APIs/base";
import { LOGOUT_ENDPOINT, SESSION_ENDPOINT } from "@/APIs/endpoints";

export type SessionUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export const sessionGet = async (): Promise<SessionUser | null> => {
  const response = await base_url.get(SESSION_ENDPOINT);
  return (response.data.user ?? null) as SessionUser | null;
};

export const logoutPost = () => base_url.post(LOGOUT_ENDPOINT, {});
