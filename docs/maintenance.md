# 维护指南

本文面向 Coding Standards MCP 的维护者，说明运行约束、规范维护方式、错误边界和验证方法。

## 运行方式

项目直接通过 Node.js 运行 TypeScript 源码：

```sh
node src/index.ts
```

也可以使用：

```sh
pnpm --silent start
```

无需生成 `dist/`，但运行时必须保留 `src/`、`standards/`、`package.json` 和已安装的 `node_modules/`。规范目录相对于服务器源码定位，因此不受客户端启动目录影响。

服务器使用 `stdio` 传输。标准输出只能承载 MCP 协议，不应写入启动提示或调试日志。

## 原生 TypeScript 约束

Node.js 通过原生类型剥离执行源码，不读取 `tsconfig.json` 来解析路径别名，也不在运行时执行类型检查。维护源码时需要遵守以下约束：

- 本地源码导入使用实际的 `.ts` 扩展名，不能引用尚未生成的 `.js` 文件；
- 第三方依赖的导入路径保持不变；
- 只使用可以直接剥离的 TypeScript 类型语法；
- 不使用 `.tsx`、JSX、枚举、参数属性等需要代码转换的语法。

## 规范目录

```text
standards/
  common.md                     # 英文公共规范
  projects/
    spammer-web.md              # 项目专属英文规范
```

只有 `standards/projects/` 直接子级中的 `.md` 普通文件会登记为项目。其他扩展名、子目录和文件符号链接均会忽略。项目不使用单独的注册配置，也不接受任意文件路径作为项目名。

## 维护规范

1. 将适用于所有已登记项目的英文规则写入 `standards/common.md`。
2. 为真实项目创建 `standards/projects/<项目名称>.md`，并写入英文补充规则。
3. 使用清晰且唯一的条款名称，避免公共规范和项目规范产生含糊冲突。
4. 新增、修改或删除规范后，下次工具调用会立即读取新内容，无需重启服务器。

项目规范可以明确覆盖公共规范中的特定条款。例如，公共规范包含：

```md
### Quote Style

Use single quotes.
```

项目规范可以声明：

```md
### Project Quote Style

Overrides "Quote Style" in the common standards: use double quotes.
```

服务器会完整保留公共规范和项目规范的原文，不解析条款、不删除冲突规则，也不会验证覆盖声明。规范维护者负责确保覆盖关系明确且一致。

## 查询与错误边界

- 项目名称必须和 `standards/projects/<项目名称>.md` 精确匹配。
- 未找到项目时返回空文本，并且不读取公共规范。
- 已登记项目所需的文档缺失或无法读取时，返回 `isError: true` 和错误说明，不返回空结果或残缺文档。
- `standards/projects/` 缺失或无法读取时，返回 `isError: true`，不会将故障误报为未知项目。
- 返回内容的组合标题只包含项目名称，公共规范与项目规范使用分隔线隔开。
- 多文件读取不是事务快照；同时修改公共规范和项目规范时，一次调用可能读到不同更新时刻的内容。

## 从多语言目录迁移

如果从旧的多语言目录结构升级，需要完成以下调整：

- 移除调用中的 `lang` 参数，只传入 `projectName`；
- 将英文公共规范和项目规范从 `standards/en/` 移至 `standards/`；
- 不再依赖 `standards/<语言>/` 目录或语言回退行为；
- 更新后重新连接 MCP 客户端，以刷新初始化指令和工具参数信息。

## 验证

运行测试：

```sh
pnpm test
```

检查格式：

```sh
pnpm format:check
```

测试覆盖工具参数、项目登记、原文保留、精确匹配、未知项目、路径输入、文档实时更新、读取故障、旧目录行为、MCP 参数校验，以及真实 `stdio` 子进程握手和英文规范查询。
