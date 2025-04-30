import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import got from 'got';
import CallExternalService from '../../../../src/commands/call/external/service.js';

describe('call external service', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    $$.SANDBOX.stub(got, 'get').resolves({
      json: () =>
        Promise.resolve({
          text: '42 is the answer to life, the universe, and everything',
          number: 42,
          found: true,
          type: 'trivia',
        }),
    });
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello', async () => {
    await CallExternalService.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.match(/^\d+ is the .+$/);
  });

  it('runs hello with --json and no provided name', async () => {
    const result = await CallExternalService.run([]);
    expect(result.text).to.match(/^\d+ is the .+$/);
  });

  it('runs hello world --name Astro', async () => {
    await CallExternalService.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.match(/^\d+ is the .+$/);
  });
});
