import * as fs from 'node:fs/promises';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('my-first-plugin', 'cml.convert.prod-cfg-rules');

interface PcrRule {
  ApiName: string;
  ConfigurationRuleDefinition: string; // This is a JSON string that needs to be parsed
  Description: string;
  EffectiveFromDate: string;
  EffectiveToDate: string;
  Id: string;
  IsDeleted: string;
  Name: string;
  ProcessScope: string;
  RuleSubType: string;
  RuleType: string;
  Sequence: string;
  Status: string;
}

interface ConfigurationRuleDefinition {
  usageSubType: string;
  sequence: number;
  criteriaExpressionType: string;
  apiName: string;
  endDate: string | null;
  criteria: unknown[];
  scope: string;
  name: string;
  description: string;
  actions: unknown[];
  startDate: string;
  status: string;
}

interface ConfigRuleDefinition {
  apiName: string;
  name: string;
  description: string;
  configurationRuleDefinition: ConfigurationRuleDefinition;
  sequence: number;
  status: string;
  effectiveFromDate: string;
  effectiveToDate: string | null;
}

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

    // TODO: log every flag
    const api = flags['cml-api'];
    this.log(`Using CML API: ${api}`);
    const pcrFile = flags['pcr-file'];
    this.log(`Using PCR File: ${pcrFile}`);
    const workspaceDir = flags['workspace-dir'];
    this.log(`Using Workspace Directory: ${workspaceDir}`);
    const targetOrg = flags['target-org'];
    this.log(`Using Target Org: ${targetOrg.getUsername()}`);

    // Read and parse the PCR file JSON
    const pcrFileContents = await fs.readFile(pcrFile, 'utf8');
    const pcrData = JSON.parse(pcrFileContents) as PcrRule[];

    // Log the structure of the first rule for inspection
    if (pcrData.length > 0) {
      this.log('First rule structure:');
      this.log(JSON.stringify(pcrData[0], null, 2));
    }

    // Create list of configuration rule definitions
    const configRuleDefinitions: ConfigRuleDefinition[] = pcrData.map((rule) => {
      const parsedDefinition = JSON.parse(rule.ConfigurationRuleDefinition) as ConfigurationRuleDefinition;
      return {
        apiName: rule.ApiName,
        name: rule.Name,
        description: rule.Description,
        configurationRuleDefinition: parsedDefinition,
        sequence: parseInt(rule.Sequence, 10),
        status: rule.Status,
        effectiveFromDate: rule.EffectiveFromDate,
        effectiveToDate: rule.EffectiveToDate || null,
      };
    });

    this.log(`Parsed ${configRuleDefinitions.length} configuration rules`);

    return {
      path: 'src/commands/cml/convert/prod-cfg-rules.ts',
    };
  }
}
