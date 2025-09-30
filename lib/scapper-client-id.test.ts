
import { scrapeClientId } from './scapper-client-id';

describe('scrapeClientId', () => {
  it('should return a client ID', async () => {
    const clientId = await scrapeClientId();
    expect(clientId).not.toBeNull();
    expect(typeof clientId).toBe('string');
  });
});
