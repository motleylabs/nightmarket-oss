import Bugsnag from '@bugsnag/js';

const NEXT_PUBLIC_BUGSNAG_API_KEY = process.env.NEXT_PUBLIC_BUGSNAG_API_KEY as string;

export function start() {
  // next.js executes top-level code at build time. See https://github.com/vercel/next.js/discussions/16840 for further example
  // So use NEXT_PHASE to avoid Bugsnag.start being executed during the build phase
  // See https://nextjs.org/docs/api-reference/next.config.js/introduction and https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/constants.ts#L1-L5 for
  // more details on NEXT_PHASE
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    if (process.env.NEXT_IS_SERVER) {
      // Bugsnag.start({
      //   apiKey: NEXT_PUBLIC_BUGSNAG_API_KEY,
      //   appVersion: process.env.NEXT_BUILD_ID,
      //   // @bugsnag/plugin-aws-lambda must only be imported on the server
      //   plugins: [require('@bugsnag/plugin-aws-lambda')],
      // });
    } else {
      // If preferred two separate Bugsnag projects e.g. a javascript and a node project could be used rather than a single one
      Bugsnag.start({
        apiKey: NEXT_PUBLIC_BUGSNAG_API_KEY,
        appVersion: process.env.NEXT_BUILD_ID,
        plugins: [],
      });
    }
  }
}

// export function getServerlessHandler() {
//   return Bugsnag.getPlugin('awsLambda').createHandler();
// }

// Could potentially export this function to standardise bugsnag notifications and explain different fields
export function notifyInstructionError(
  err: Error | { name: string; message: string }, // probably an Error
  context: {
    operation: string;
    metadata: {
      userPubkey: string;
      programLogs: string;
      nft: any;
      [key: string]: any;
    };
  }
) {
  return Bugsnag.notify(err, function (event) {
    event.context = context.operation; // Sets the context of the error
    // Bugsnag already tracks userIp, so it's better to include the userPubkey with metadata
    // event.setUser(context.userPubkey); // this could be set and removed globally, but easier to attatch here for now
    event.addMetadata(
      'INSTRUCTION METADATA', // creates a tab in the bugsnag error with this title in all caps
      context.metadata
    );
  });
}
