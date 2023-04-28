import config from '../app.config';

export const getBuddyStats = async (address: string) => {
  // Disclaimer: Do not change the url structure. The query string structure is not standard but it works this way
  // The api provider is supposed to change it in the future
  const response = await fetch(
    `${config.referralUrl}referral/user&wallet=${address}&organisation=${config.referralOrg}`,
    {
      headers: {
        Authorization: config.referralKey,
      },
    }
  );

  const buddyStats = await response.json();

  return buddyStats;
};
