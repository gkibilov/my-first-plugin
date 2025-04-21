import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('my-first-plugin', 'connect.org');

export type ConnectOrgResult = Array<{ Name: string; Id: string }>;

export default class ConnectOrg extends SfCommand<ConnectOrgResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-org': Flags.requiredOrg(),
  };

  public async run(): Promise<ConnectOrgResult> {
    // parse the provided flags
    const { flags } = await this.parse(ConnectOrg);

    // Get the orgId from the Org instance stored in the `target-org` flag
    const orgId = flags['target-org'].getOrgId();
    // Get the connection from the Org instance stored in the `target-org` flag
    const connection = flags['target-org'].getConnection();

    this.log(`Connected to ${flags['target-org'].getUsername()} (${orgId}) with API version ${connection.version}`);

    // Use the connection to execute a SOQL query against the org
    const result = await connection.query<{ Name: string; Id: string }>('SELECT Id, Name FROM Account');

    // Log the results
    if (result.records.length > 0) {
      this.log('Found the following Accounts:');
      for (const record of result.records) {
        this.log(`  • ${record.Name}: ${record.Id}`);
      }
    } else {
      this.log('No Accounts found.');
    }

    return result.records;
  }
}
