import * as fs from 'node:fs/promises';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ConfiguratorRuleInput } from '../../../shared/models.js';
import { generateCMLFromGroup } from '../../../shared/cml.js';
import { groupByNonIntersectingProduct2 } from '../../../shared/grouping.js';

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

    const api = flags['cml-api'];
    const pcrFile = flags['pcr-file'];
    const workspaceDir = flags['workspace-dir'];
    const targetOrg = flags['target-org'];

    this.log(`Using CML API: ${api}`);
    this.log(`Using PCR File: ${pcrFile}`);
    this.log(`Using Workspace Directory: ${workspaceDir}`);
    this.log(`Using Target Org: ${targetOrg.getUsername()}`);

    const pcrFileContents = await fs.readFile(pcrFile, 'utf8');
    const pcrData = JSON.parse(pcrFileContents) as Array<{
      ApiName: string;
      Name: string;
      Description: string;
      Sequence: string;
      Status: string;
      EffectiveFromDate: string;
      EffectiveToDate?: string;
      ConfigurationRuleDefinition: string;
    }>;

    if (pcrData.length > 0) {
      this.log('First rule structure:');
      this.log(JSON.stringify(pcrData[0], null, 2));
    }

    const rules: ConfiguratorRuleInput[] = [];

    for (const raw of pcrData) {
      try {
        const parsed = JSON.parse(raw.ConfigurationRuleDefinition) as ConfiguratorRuleInput;
        rules.push(parsed);
      } catch {
        this.warn(`❌ Failed to parse ConfigurationRuleDefinition for rule: ${raw.Name}`);
      }
    }

    this.log(`Parsed ${rules.length} valid configuration rules`);

    const groups = groupByNonIntersectingProduct2(rules);
    this.log(`Found ${groups.size} non-intersecting Product2 groups`);

    const safeApi = api.replace(/[^a-zA-Z0-9_-]/g, '_');
    let groupIndex = 1;

    const writePromises = Array.from(groups.entries()).map(async ([product2Id, group]) => {
      const cmlOutput = generateCMLFromGroup(group);
      const fileName = groups.size === 1 ? `${safeApi}.cml` : `${safeApi}_${groupIndex++}.cml`;

      const fullPath = workspaceDir ? `${workspaceDir}/${fileName}` : fileName;

      this.log(`📦 Writing group with ${group.length} rules to ${fileName}`);

      await fs.writeFile(fullPath, cmlOutput, 'utf8');
      this.log(`✅ Wrote CML for Product2 ${product2Id} to ${fullPath}`);
    });

    await Promise.all(writePromises);

    return {
      path: 'src/commands/cml/convert/prod-cfg-rules.ts',
    };
  }
}
