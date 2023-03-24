import { setup } from 'axios-cache-adapter';
import config from '../app.config';

const api = setup({
  baseURL: config.referralUrl,
  cache: {
    maxAge: 60 * 1000,
    invalidate: async (config, request) => {
      if (request.clearCacheEntry && config.store) {
        //@ts-ignore
        await config.store.removeItem(config.uuid);
      }
    },
  },
});

export default api;

export async function getBuddyStats(wallet: string, invalidate = false) {
  const data = await api.get(`/referral/user&wallet=${wallet}&organisation=${config.referralOrg}`, {
    clearCacheEntry: invalidate,
    headers: {
      Authorization: config.referralKey,
    },
  });

  return data.data;
}
