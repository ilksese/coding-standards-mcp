import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";

/** 为单个测试创建独立的规范目录，并在结束时清理测试创建的文件。 */
export async function createFixture(t: TestContext) {
  const temporaryRoot = join(tmpdir(), "opencode");
  await mkdir(temporaryRoot, { recursive: true });
  const directory = await mkdtemp(join(temporaryRoot, "coding-standards-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  const projectsDirectory = join(directory, "projects");
  await mkdir(projectsDirectory, { recursive: true });
  await writeFile(join(directory, "common.md"), "Common original\nKeep whitespace.\n");
  await writeFile(join(projectsDirectory, "alpha.md"), "Project original\nExplicit overrides.\n");

  return { directory, projectsDirectory };
}
