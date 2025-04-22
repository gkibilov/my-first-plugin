import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('my-first-plugin', 'cml.import.as-expression-set');

export type CmlImportAsExpressionSetResult = {
  path: string;
};

export default class CmlImportAsExpressionSet extends SfCommand<CmlImportAsExpressionSetResult> {
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
    'target-org': Flags.requiredOrg(),
    'context-definition': Flags.string({
      summary: messages.getMessage('flags.context-definition.summary'),
      char: 'x',
      required: true,
    }),
    'cml-api': Flags.string({
      summary: messages.getMessage('flags.cml-api.summary'),
      char: 'c',
      required: true,
    }),
    'workspace-dir': Flags.directory({
      summary: messages.getMessage('flags.workspace-dir.summary'),
      char: 'd',
      exists: true,
    }),
  };

  public async run(): Promise<CmlImportAsExpressionSetResult> {
    const { flags } = await this.parse(CmlImportAsExpressionSet);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from src/commands/cml/import/as-expression-set.ts`);
    return {
      path: 'src/commands/cml/import/as-expression-set.ts',
    };
  }
}
