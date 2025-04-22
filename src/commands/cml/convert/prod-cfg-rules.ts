import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('my-first-plugin', 'cml.convert.prod-cfg-rules');

export type CmlConvertProdCfgRulesResult = {
  path: string;
};

export default class CmlConvertProdCfgRules extends SfCommand<CmlConvertProdCfgRulesResult> {
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
    'pcr-file': Flags.file({
      summary: messages.getMessage('flags.pcr-file.summary'),
      char: 'r',
      required: true,
      exists: true,
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

  public async run(): Promise<CmlConvertProdCfgRulesResult> {
    const { flags } = await this.parse(CmlConvertProdCfgRules);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from src/commands/cml/convert/prod-cfg-rules.ts`);
    return {
      path: 'src/commands/cml/convert/prod-cfg-rules.ts',
    };
  }
}
