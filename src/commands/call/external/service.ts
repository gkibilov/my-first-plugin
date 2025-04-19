import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('my-first-plugin', 'call.external.service');

export type CallExternalServiceResult = {
  path: string;
};

export default class CallExternalService extends SfCommand<CallExternalServiceResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'n',
      required: false,
    }),
  };

  public async run(): Promise<CallExternalServiceResult> {
    const { flags } = await this.parse(CallExternalService);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from src/commands/call/external/service.ts`);
    return {
      path: 'src/commands/call/external/service.ts',
    };
  }
}
