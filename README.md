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

服务仅提供 `get_coding_standards` 工具，参数如下：

```json
{ "projectName": "your-project" }
```

`projectName` 必须与已登记项目的名称准确匹配，区分大小写且不包含 `.md` 后缀。

查询已登记项目时，工具返回完整的公共规范和项目规范。项目规范中明确声明的覆盖条款优先，其他公共条款继续适用。

查询未登记项目时，工具返回空文本；读取规范失败时，工具返回错误结果。

规范文档统一以英文维护。

## 更多文档

- [维护指南](./docs/maintenance.md)
- [领域术语](./GLOSSARY.md)
