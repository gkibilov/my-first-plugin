import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import ConnectOrg from '../../../src/commands/connect/org.js';

describe('connect org', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello', async () => {
    await ConnectOrg.run(['--target-org', 'test@example.com']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('Connected to test@example.com');
  });

  it('runs hello with --json and no provided name', async () => {
    const result = await ConnectOrg.run(['--target-org', 'test@example.com']);
    expect(result).to.be.an('array');
  });

  it('runs hello world --name Astro', async () => {
    await ConnectOrg.run(['--target-org', 'test@example.com']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('Connected to test@example.com');
  });
});
