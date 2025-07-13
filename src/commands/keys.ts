import { CommandNotImplementedError } from '@-xun/cli';
import { scriptBasename } from '@-xun/cli/util';

import { withGlobalBuilder, withGlobalUsage } from 'universe:util.ts';

import type { AsStrictExecutionContext, ChildConfiguration } from '@-xun/cli';
import type { GlobalCliArguments, GlobalExecutionContext } from 'universe:configure.ts';

export type CustomCliArguments = GlobalCliArguments;

export default function command({
  standardDebug
}: AsStrictExecutionContext<GlobalExecutionContext>): ChildConfiguration<
  CustomCliArguments,
  GlobalExecutionContext
> {
  const [builder, withGlobalHandler] = withGlobalBuilder<CustomCliArguments>();

  return {
    builder,
    description: 'Manage NHSCC API keys',
    usage: withGlobalUsage(),
    handler: withGlobalHandler(function ({
      $0: scriptFullName,
      hush: isHushed,
      quiet: isQuieted,
      silent: isSilenced,
      targets
    }) {
      const debug = standardDebug.extend(`handler-${scriptBasename(scriptFullName)}`);

      debug('entered handler');

      debug('targets: %O', targets);
      debug('isHushed: %O', isHushed);
      debug('isQuieted: %O', isQuieted);
      debug('isSilenced: %O', isSilenced);

      throw new CommandNotImplementedError();
    })
  };
}
