import assert from "node:assert/strict";
import { chmod, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { getCodingStandards } from "../src/standards.ts";
import { createFixture } from "./helpers.ts";

test("按公共规范在前、项目规范在后的顺序保留两份完整原文", async (t) => {
  const { directory } = await createFixture(t);
  const result = await getCodingStandards("alpha", directory);

  assert.equal(
    result,
    ["# alpha", "Common original\nKeep whitespace.\n", "---", "Project original\nExplicit overrides.\n"].join("\n\n")
  );
});

test("未知名称、大小写差异、额外空白、空名称和路径均不匹配", async (t) => {
  const { directory } = await createFixture(t);

  for (const name of [
    "unknown",
    "Alpha",
    " alpha",
    "alpha ",
    "alpha.md",
    "",
    "../common",
    "../../common",
    "/alpha",
    "projects/alpha",
    "..\\common",
    "alpha\0"
  ]) {
    assert.equal(await getCodingStandards(name, directory), "Common original\nKeep whitespace.\n", name);
  }
});

test("未知项目和已登记项目在公共规范缺失时均报错", async (t) => {
  const { directory } = await createFixture(t);
  await rm(join(directory, "common.md"));

  await assert.rejects(getCodingStandards("unknown", directory), { code: "ENOENT" });
  await assert.rejects(getCodingStandards("alpha", directory), {
    code: "ENOENT"
  });
});

test("实时读取公共和项目文档，新增或删除项目无需重启", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  const original = await getCodingStandards("alpha", directory);
  await writeFile(join(directory, "common.md"), "更新后的公共规范");
  await writeFile(join(projectsDirectory, "alpha.md"), "更新后的项目规范");

  const updated = await getCodingStandards("alpha", directory);
  assert.notEqual(updated, original);
  assert.ok(updated.includes("更新后的公共规范"));
  assert.ok(updated.includes("更新后的项目规范"));

  assert.equal(await getCodingStandards("beta", directory), "更新后的公共规范");
  await writeFile(join(projectsDirectory, "beta.md"), "新项目规范");
  assert.ok((await getCodingStandards("beta", directory)).includes("新项目规范"));
  await rm(join(projectsDirectory, "beta.md"));
  assert.equal(await getCodingStandards("beta", directory), "更新后的公共规范");
});

test("只有 .md 普通文件登记为项目，忽略目录、其他扩展名与符号链接", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  await mkdir(join(projectsDirectory, "folder.md"));
  await writeFile(join(projectsDirectory, "other.txt"), "不是规范");
  await symlink(join(directory, "common.md"), join(projectsDirectory, "link.md"));

  for (const name of ["folder", "other", "link"]) {
    assert.equal(await getCodingStandards(name, directory), "Common original\nKeep whitespace.\n");
  }
});

test("公共规范读取失败和项目目录故障不会被吞掉", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  await rm(join(directory, "common.md"));
  await mkdir(join(directory, "common.md"));
  await assert.rejects(getCodingStandards("alpha", directory), {
    code: "EISDIR"
  });

  await rm(projectsDirectory, { recursive: true });
  await assert.rejects(getCodingStandards("alpha", directory), {
    code: "ENOENT"
  });
});

test("相互冲突的规则保留原文，不执行语义覆盖或删除", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  await writeFile(join(directory, "common.md"), "引号：使用单引号。");
  await writeFile(join(projectsDirectory, "alpha.md"), "覆盖公共规范中的『引号』：使用双引号。");

  const result = await getCodingStandards("alpha", directory);
  assert.ok(result.includes("引号：使用单引号。"));
  assert.ok(result.includes("覆盖公共规范中的『引号』：使用双引号。"));
});

test("文档权限错误明确报错", { skip: process.platform === "win32" || process.getuid?.() === 0 }, async (t) => {
  const { directory } = await createFixture(t);
  const commonPath = join(directory, "common.md");
  await chmod(commonPath, 0);

  try {
    await assert.rejects(getCodingStandards("alpha", directory), { code: "EACCES" });
  } finally {
    await chmod(commonPath, 0o600);
  }
});

test("projects 不是目录时明确报错，而不是返回未知项目", async (t) => {
  const { directory, projectsDirectory } = await createFixture(t);
  await rm(projectsDirectory, { recursive: true });
  await writeFile(projectsDirectory, "损坏的目录结构");

  await assert.rejects(getCodingStandards("alpha", directory), { code: "ENOTDIR" });
});

test("只读取简化目录，不登记旧语言目录中的项目，也不回退到旧文档", async (t) => {
  const { directory } = await createFixture(t);
  const original = await getCodingStandards("alpha", directory);
  for (const language of ["en", "zh"]) {
    const legacyDirectory = join(directory, language);
    await mkdir(join(legacyDirectory, "projects"), { recursive: true });
    await writeFile(join(legacyDirectory, "common.md"), "Legacy common");
    await writeFile(join(legacyDirectory, "projects", "alpha.md"), "Legacy project");
    await writeFile(join(legacyDirectory, "projects", "legacy.md"), "Legacy-only project");
  }

  assert.equal(await getCodingStandards("alpha", directory), original);
  assert.equal(await getCodingStandards("legacy", directory), "Common original\nKeep whitespace.\n");
  await rm(join(directory, "common.md"));
  await assert.rejects(getCodingStandards("alpha", directory), { code: "ENOENT" });
});
