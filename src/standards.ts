import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const defaultStandardsDirectory = fileURLToPath(new URL("../standards/", import.meta.url));

/** 按确切项目名读取英文公共规范与项目规范，保留两份完整原文。 */
export async function getCodingStandards(
  projectName: string,
  standardsDirectory = defaultStandardsDirectory
): Promise<string> {
  const projectsDirectory = join(standardsDirectory, "projects");
  const entries = await readdir(projectsDirectory, { withFileTypes: true });

  // 先以目录中的普通文件精确登记，避免把输入直接用作路径或跟随文件符号链接。
  // 每次重新登记并读取，使新增、删除及内容修改都无需重启即可生效。
  const project = entries.find(
    (entry) => projectName.length > 0 && entry.isFile() && entry.name === `${projectName}.md`
  );

  // 未匹配不读取公共规范，确保不会退回只有公共规范的不完整结果。
  if (!project) {
    return "";
  }

  const [common, projectStandards] = await Promise.all([
    readFile(join(standardsDirectory, "common.md"), "utf8"),
    readFile(join(projectsDirectory, project.name), "utf8")
  ]);

  // 标题仅包含项目名，使用分隔线区分两份完整原文。
  return [`# ${projectName}`, common, "---", projectStandards].join("\n\n");
}
