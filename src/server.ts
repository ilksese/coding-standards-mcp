import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { getCodingStandards } from "./standards.ts";

/** 创建仅提供代码规范查询工具的 MCP 服务器，不启动传输连接。 */
export function createServer(standardsDirectory?: string): McpServer {
  const server = new McpServer(
    {
      name: "coding-standards-mcp",
      title: "Project Coding Standards",
      version: "0.1.0",
      description:
        "Load shared and project-specific coding standards before implementing features, fixing bugs, refactoring, or reviewing code."
    },
    {
      instructions: [
        "Before creating or modifying project code, call get_coding_standards for the target project and apply the returned standards.",
        "Also use it before code reviews to check the project's conventions. This includes component organization, internationalization, comments, and maintainability rules.",
        "Use the exact project name. The project name identifies the code being worked on, not this MCP server. Standards are maintained in English; there is no language parameter or automatic translation.",
        "Explicit project overrides take precedence over the corresponding common rules; all other common rules remain applicable.",
        "Unregistered projects receive only the full common standards; do not invent project rules or retry guessed aliases.",
        "If the tool fails, report the failure and do not modify project code until the failure is resolved."
      ].join("\n")
    }
  );

  server.registerTool(
    "get_coding_standards",
    {
      title: "Load Project Coding Standards Before Coding",
      description: [
        "Call before writing or editing code: implementing features, fixing bugs, refactoring, or adding components and tests. Also call before code reviews to load the project's conventions.",
        "Returns the full shared standards followed by project-specific standards, including component organization, internationalization, comments, and maintainability guidance when defined.",
        "Apply explicit project overrides to the corresponding common rules; keep all other common rules. Read-only: does not edit files, lint code, or automatically fix violations.",
        "Requires only the target project name. Returns English standards without language selection or automatic translation. Unregistered projects return only the full common standards. Read failures return a tool error."
      ].join(" "),
      inputSchema: {
        projectName: z
          .string()
          .describe(
            'Exact name of the target project, e.g. "your-project". Project-specific standards require a case-sensitive match to a registered filename without .md; otherwise only common standards are returned. No paths, aliases, trimming, or fuzzy matching.'
          )
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ projectName }) => {
      try {
        const text = await getCodingStandards(projectName, standardsDirectory);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        // 文件系统故障与未匹配项目语义不同，使用 MCP 工具错误显式区分。
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `读取代码规范失败：${message}` }]
        };
      }
    }
  );

  return server;
}
