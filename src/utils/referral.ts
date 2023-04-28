import config from '../app.config';

export const getBuddyStats = async (address: string) => {
  const response = await fetch(
    `${config.referralUrl}referral/user?wallet=${address}&organisation=${config.referralOrg}`,
    {
      headers: {
        Authorization: config.referralKey,
      },
    }
  );

  const buddyStats = await response.json();

  return buddyStats;
};
