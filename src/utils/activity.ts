export const getActivityTypes = (activity: 'listing' | 'bid' | 'transaction'): string[] => {
  switch (activity) {
    case 'listing':
      return ['listing', 'delisting', 'updatelisting'];
    case 'bid':
      return ['bid', 'cancelbid', 'updatebid'];
    default:
      return ['transaction'];
  }
};
