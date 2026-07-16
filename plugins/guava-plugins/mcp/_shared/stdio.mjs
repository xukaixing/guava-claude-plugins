/**
 * Minimal MCP stdio JSON-RPC host.
 */
export function createStdioServer({ name, version = '1.0.0', tools, callTool }) {
  const SERVER_INFO = { name, version };

  function send(msg) {
    process.stdout.write(`${JSON.stringify(msg)}\n`);
  }

  function ok(id, result) {
    send({ jsonrpc: '2.0', id, result });
  }

  function fail(id, code, message) {
    send({ jsonrpc: '2.0', id, error: { code, message } });
  }

  /**
   * @param {any} msg
   */
  async function handleMessage(msg) {
    if (!msg || msg.jsonrpc !== '2.0') return;
    const { id, method, params } = msg;

    if (id === undefined || id === null) {
      if (method === 'notifications/initialized' || method === 'initialized') return;
      return;
    }

    try {
      switch (method) {
        case 'initialize':
          ok(id, {
            protocolVersion: params?.protocolVersion || '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: SERVER_INFO,
          });
          return;
        case 'ping':
          ok(id, {});
          return;
        case 'tools/list':
          ok(id, { tools });
          return;
        case 'tools/call': {
          const toolName = params?.name;
          const args = params?.arguments || {};
          const result = callTool(toolName, args);
          ok(id, {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
          });
          return;
        }
        default:
          fail(id, -32601, `Method not found: ${method}`);
      }
    } catch (err) {
      fail(id, -32000, err instanceof Error ? err.message : String(err));
    }
  }

  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        void handleMessage(msg);
      } catch (err) {
        send({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
          },
        });
      }
    }
  });

  process.stdin.on('end', () => process.exit(0));
}
