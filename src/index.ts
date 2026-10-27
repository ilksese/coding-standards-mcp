import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";

async function main(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  // stdout 专供 MCP 协议使用，启动故障只写入 stderr。
  console.error("代码规范 MCP 服务器启动失败：", error);
  process.exitCode = 1;
});
