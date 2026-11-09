import assert from "node:assert/strict";
import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.ts";
import { getCodingStandards, listSupportedProjects } from "../src/standards.ts";
import { createFixture } from "./helpers.ts";

/** 使用真实 MCP 客户端与内存传输验证工具协议，不绕过参数校验。 */
async function connectClient(t: TestContext, directory: string): Promise<Client> {
  const server = createServer(directory);
  const client = new Client({ name: "coding-standards-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

test("初始化元数据和工具说明使用英文，并明确编码前查询与结果边界", async (t) => {
  const { directory } = await createFixture(t);
  const client = await connectClient(t, directory);
  const serverInfo = client.getServerVersion();
  const instructions = client.getInstructions();
  const { tools } = await client.listTools();
  const tool = tools[0];

  assert.equal(serverInfo?.title, "Project Coding Standards");
  assert.match(serverInfo?.description ?? "", /before implementing features/);
  assert.match(instructions ?? "", /Before creating or modifying project code, call get_coding_standards/);
  assert.match(instructions ?? "", /If the tool fails.*do not modify project code/);
  assert.equal(tool?.title, "Load Project Coding Standards Before Coding");
  assert.match(tool?.description ?? "", /Call before writing or editing code/);
  assert.match(tool?.description ?? "", /Unregistered projects return an empty string, not common standards/);
  assert.match(tool?.description ?? "", /Returns English standards without language selection/);
  assert.doesNotMatch(instructions ?? "", /lang:|fall.?back/i);
  assert.doesNotMatch(tool?.description ?? "", /lang defaults|fall.?back/i);
  assert.doesNotMatch(
    JSON.stringify({
      serverInfo,
      instructions,
      title: tool?.title,
      description: tool?.description,
      schema: tool?.inputSchema
    }),
    /\p{Script=Han}/u
  );
});

test("暴露规范查询和项目列表工具，规范查询仍只要求 projectName", async (t) => {
  const { directory } = await createFixture(t);
  const client = await connectClient(t, directory);
  const { tools } = await client.listTools();

  assert.equal(tools.length, 2);
  assert.equal(tools[0]?.name, "get_coding_standards");
  assert.deepEqual(tools[0]?.inputSchema.required, ["projectName"]);
  const projectSchema = tools[0]?.inputSchema.properties?.projectName;
  assert.ok(projectSchema && typeof projectSchema === "object" && "type" in projectSchema);
  assert.equal(projectSchema.type, "string");
  assert.deepEqual(Object.keys(tools[0]?.inputSchema.properties ?? {}), ["projectName"]);
  assert.equal(tools[0]?.annotations?.readOnlyHint, true);
  assert.equal(tools[1]?.name, "list_supported_projects");
  assert.deepEqual(tools[1]?.inputSchema.properties, {});
  assert.equal(tools[1]?.annotations?.readOnlyHint, true);
  assert.doesNotMatch(JSON.stringify(tools[1]), /\p{Script=Han}/u);
});

test("MCP 工具返回组合文本，未匹配时返回精确的空字符串", async (t) => {
  const { directory } = await createFixture(t);
  const client = await connectClient(t, directory);
  const result = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "alpha" }
  });

  assert.notEqual(result.isError, true);
  assert.deepEqual(result.content, [{ type: "text", text: await getCodingStandards("alpha", directory) }]);

  const missing = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "unknown" }
  });
  assert.notEqual(missing.isError, true);
  assert.deepEqual(missing.content, [{ type: "text", text: "" }]);
});

test("缺少参数或参数类型错误由 MCP 参数校验拒绝", async (t) => {
  const { directory } = await createFixture(t);
  const client = await connectClient(t, directory);

  for (const args of [{}, { projectName: 123 }, { projectName: null }, { projectName: [] }]) {
    const result = await client.callTool({
      name: "get_coding_standards",
      arguments: args
    });
    assert.equal(result.isError, true);
  }
});

test("读取故障返回 isError，不返回空字符串，服务器可继续处理查询", async (t) => {
  const { directory } = await createFixture(t);
  const client = await connectClient(t, directory);
  await rm(join(directory, "common.md"));

  const failed = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "alpha" }
  });
  assert.equal(failed.isError, true);
  assert.match(JSON.stringify(failed.content), /读取代码规范失败.*ENOENT/);

  const missing = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "unknown" }
  });
  assert.notEqual(missing.isError, true);
  assert.deepEqual(missing.content, [{ type: "text", text: "" }]);

  await writeFile(join(directory, "common.md"), "Restored common standards");
  const restored = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "alpha" }
  });
  assert.notEqual(restored.isError, true);
  assert.deepEqual(restored.content, [{ type: "text", text: await getCodingStandards("alpha", directory) }]);
});

test("MCP 查询实时读取规范，无需重连", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  const client = await connectClient(t, directory);
  const original = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "alpha" }
  });
  await writeFile(join(directory, "common.md"), "Updated common standards");
  await writeFile(join(projectsDirectory, "alpha.md"), "Updated project standards");
  const updated = await client.callTool({
    name: "get_coding_standards",
    arguments: { projectName: "alpha" }
  });
  assert.notEqual(updated.isError, true);
  assert.notDeepEqual(updated.content, original.content);
  assert.deepEqual(updated.content, [{ type: "text", text: await getCodingStandards("alpha", directory) }]);
});

for (const launch of [
  {
    name: "原生 Node 入口（不加载 tsx）",
    command: process.execPath,
    args: [fileURLToPath(new URL("../src/index.ts", import.meta.url))]
  },
  {
    name: "pnpm start 兼容入口",
    command: "pnpm",
    args: ["--silent", "--dir", fileURLToPath(new URL("../", import.meta.url)), "start"]
  }
]) {
  test(`${launch.name}：真实 stdio 握手和查询，且不依赖启动目录`, { timeout: 15000 }, async (t) => {
    const { directory } = await createFixture(t);
    const client = new Client({ name: "stdio-test", version: "1.0.0" });
    const transport = new StdioClientTransport({
      command: launch.command,
      args: launch.args,
      cwd: directory,
      stderr: "pipe"
    });
    let stderr = "";
    transport.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    t.after(() => client.close());

    await client.connect(transport);
    assert.equal(client.getServerVersion()?.title, "Project Coding Standards");
    assert.match(
      client.getInstructions() ?? "",
      /Before creating or modifying project code, call get_coding_standards/
    );
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["get_coding_standards", "list_supported_projects"]
    );
    assert.deepEqual(Object.keys(tools[0]?.inputSchema.properties ?? {}), ["projectName"]);

    const projects = await client.callTool({ name: "list_supported_projects" });
    assert.notEqual(projects.isError, true);
    assert.deepEqual(projects.content, [{ type: "text", text: JSON.stringify(await listSupportedProjects()) }]);

    const result = await client.callTool({
      name: "get_coding_standards",
      arguments: { projectName: "spammer-web" }
    });
    assert.notEqual(result.isError, true);
    assert.deepEqual(result.content, [{ type: "text", text: await getCodingStandards("spammer-web") }]);
    assert.match(JSON.stringify(result.content), /JSDoc/);
    assert.match(JSON.stringify(result.content), /useTranslation/);
    assert.match(JSON.stringify(result.content), /ui-design/);
    assert.match(JSON.stringify(result.content), /500/);

    const missing = await client.callTool({
      name: "get_coding_standards",
      arguments: { projectName: "not-registered" }
    });
    assert.deepEqual(missing.content, [{ type: "text", text: "" }]);
    assert.equal(stderr, "");
  });
}

test("项目列表实时排序，仅登记普通 Markdown 文件，且不读取规范正文", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  const client = await connectClient(t, directory);
  await writeFile(join(projectsDirectory, "zeta.md"), "Zeta");
  await writeFile(join(projectsDirectory, "Beta.md"), "Beta");
  await writeFile(join(projectsDirectory, ".md"), "Empty name");
  await writeFile(join(projectsDirectory, "ignored.txt"), "Ignored");
  await mkdir(join(projectsDirectory, "nested.md"));
  await writeFile(join(projectsDirectory, "nested.md", "hidden.md"), "Nested");
  await symlink(join(projectsDirectory, "alpha.md"), join(projectsDirectory, "linked.md"));
  await rm(join(directory, "common.md"));

  const result = await client.callTool({ name: "list_supported_projects" });
  assert.notEqual(result.isError, true);
  assert.deepEqual(result.content, [{ type: "text", text: '["Beta","alpha","zeta"]' }]);

  await rm(projectsDirectory, { recursive: true });
  await mkdir(projectsDirectory);
  const empty = await client.callTool({ name: "list_supported_projects", arguments: {} });
  assert.notEqual(empty.isError, true);
  assert.deepEqual(empty.content, [{ type: "text", text: "[]" }]);

  await rm(projectsDirectory, { recursive: true });
  const failed = await client.callTool({ name: "list_supported_projects" });
  assert.equal(failed.isError, true);
  assert.match(JSON.stringify(failed.content), /Failed to list supported projects.*ENOENT/);

  await mkdir(projectsDirectory);
  await writeFile(join(projectsDirectory, "restored.md"), "Restored");
  const restored = await client.callTool({ name: "list_supported_projects" });
  assert.notEqual(restored.isError, true);
  assert.deepEqual(restored.content, [{ type: "text", text: '["restored"]' }]);
});
