// Lightweight test shim to emulate Cloudflare Workers `env.DB` binding
// This provides a minimal, forgiving mock DB object with thenable chainable
// methods used by the application's codepaths so tests can run under Node.

function thenable(result) {
  const handler = {
    from() { return proxy; },
    where() { return proxy; },
    orderBy() { return proxy; },
    limit() { return proxy; },
    innerJoin() { return proxy; },
    select() { return proxy; },
    values() { return proxy; },
    onConflictDoUpdate() { return proxy; },
    then(resolve) { resolve(result); },
  };
  const proxy = new Proxy(() => {}, {
    get() { return () => proxy; },
    apply() { return proxy; },
  });
  Object.assign(proxy, handler);
  return proxy;
}

const mockDb = {
  select: () => thenable([]),
  insert: () => thenable([]),
  // Minimal compatibility helpers
  async run() { return []; },
};

export const env = { DB: mockDb };
