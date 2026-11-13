import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const defaultStandardsDirectory = fileURLToPath(new URL("../standards/", import.meta.url));

/** 实时列出有规范文件的项目，忽略目录、符号链接和空项目名。 */
async function listSupportedProjects(standardsDirectory: string): Promise<string[]> {
  const entries = await readdir(join(standardsDirectory, "projects"), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name.length > 3)
    .map((entry) => entry.name.slice(0, -3))
    .sort();
}

/** 按确切项目名读取英文公共规范与项目规范，保留两份完整原文。 */
export async function getCodingStandards(
  projectName: string,
  standardsDirectory = defaultStandardsDirectory
): Promise<string> {
  const projectsDirectory = join(standardsDirectory, "projects");
  const projects = await listSupportedProjects(standardsDirectory);

  // 先以目录中的普通文件精确登记，避免把输入直接用作路径或跟随文件符号链接。
  // 每次重新登记并读取，使新增、删除及内容修改都无需重启即可生效。
  const project = projects.includes(projectName);

  // 未匹配项目时仅返回公共规范原文，不把输入作为文件路径。
  if (!project) {
    return readFile(join(standardsDirectory, "common.md"), "utf8");
  }

  const [common, projectStandards] = await Promise.all([
    readFile(join(standardsDirectory, "common.md"), "utf8"),
    readFile(join(projectsDirectory, `${projectName}.md`), "utf8")
  ]);

  // 标题仅包含项目名，使用分隔线区分两份完整原文。
  return [`# ${projectName}`, common, "---", projectStandards].join("\n\n");
}
