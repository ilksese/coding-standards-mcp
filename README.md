# Coding Standards MCP

一个只读的本机 MCP 服务器，按项目名称返回英文公共代码规范和项目专属规范。

## 前置要求

- Node.js 22.18.0 或更高版本
- pnpm 10

安装依赖：

```sh
pnpm install --frozen-lockfile
```

## 连接 MCP 客户端

服务器使用 `stdio`，由 MCP 客户端直接启动。对于支持 `mcpServers` 配置的客户端，可以参考：

```json
{
  "mcpServers": {
    "coding-standards": {
      "command": "node",
      "args": ["/absolute/path/coding-standards-mcp/src/index.ts"]
    }
  }
}
```

将 `/absolute/path/coding-standards-mcp` 替换为本项目的绝对路径，并确保客户端可以在 `PATH` 中找到符合版本要求的 Node.js。

## 查询代码规范

使用 `get_coding_standards` 工具查询规范，参数如下：

```json
{ "projectName": "your-project" }
```

`projectName` 必须与已登记项目的名称准确匹配，区分大小写且不包含 `.md` 后缀。

查询已登记项目时，工具返回完整的公共规范和项目规范。项目规范中明确声明的覆盖条款优先，其他公共条款继续适用。

查询未登记项目时，工具返回空文本；读取规范失败时，工具返回错误结果。

规范文档统一以英文维护。

## 获取支持的项目列表

调用无参数工具 `list_supported_projects`，返回按名称排序的 JSON 数组，例如：

```json
["example-project", "your-project"]
```

项目名称不包含 `.md` 后缀，可直接用于 `get_coding_standards` 的 `projectName` 参数。
列表每次调用时实时读取，仅包含项目目录下的 `.md` 普通文件，不包含子目录或符号链接。
没有项目时返回 `[]`；目录读取失败时返回工具错误。

## 更多文档

- [维护指南](./docs/maintenance.md)
- [领域术语](./GLOSSARY.md)
