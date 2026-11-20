import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const defaultStandardsDirectory = fileURLToPath(new URL("../standards/", import.meta.url));

/**
 * 显式家族成员。只服务这四个名字；新项目必须改这份名单后才会插入家族层。
 * seamaid-web 不是可查询项目。
 */
const seamaidWebFamilyFile = "seamaid-web";
const seamaidWebProjects = ["kassadin-web", "chogath-web", "ksante-web", "smolder-web"] as const;

function usesSeamaidWeb(projectName: string): boolean {
  return (seamaidWebProjects as readonly string[]).includes(projectName);
}

/** 实时列出有规范文件的项目，忽略目录、符号链接和空项目名。 */
async function listSupportedProjects(standardsDirectory: string): Promise<string[]> {
  const entries = await readdir(join(standardsDirectory, "projects"), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name.length > 3)
    .map((entry) => entry.name.slice(0, -3))
    .sort();
}

/** 按确切项目名读取英文公共规范、可选家族规范与可选项目规范，保留完整原文。 */
export async function getCodingStandards(
  projectName: string,
  standardsDirectory = defaultStandardsDirectory
): Promise<string> {
  const projectsDirectory = join(standardsDirectory, "projects");
  const projects = await listSupportedProjects(standardsDirectory);

  // 先以目录中的普通文件精确登记，避免把输入直接用作路径或跟随文件符号链接。
  // 每次重新登记并读取，使新增、删除及内容修改都无需重启即可生效。
  // seamaid-web 只作为家族层文件，直接查询时与未知项目一样只返回公共规范。
  const hasProjectFile = projectName !== seamaidWebFamilyFile && projects.includes(projectName);
  const family = usesSeamaidWeb(projectName);

  // 非家族且无同名普通文件时，仅返回公共规范原文，不把输入作为文件路径。
  if (!family && !hasProjectFile) {
    return readFile(join(standardsDirectory, "common.md"), "utf8");
  }

  const parts = [`# ${projectName}`, await readFile(join(standardsDirectory, "common.md"), "utf8")];

  // 家族层是必需文件。缺失、非普通文件或读取失败都抛出，不能静默退回公共规范。
  // 名字来自固定名单，不来自查询输入。
  if (family) {
    if (!projects.includes(seamaidWebFamilyFile)) {
      throw Object.assign(new Error("ENOENT: seamaid-web.md"), { code: "ENOENT" });
    }
    parts.push("---", await readFile(join(projectsDirectory, `${seamaidWebFamilyFile}.md`), "utf8"));
  }

  // 家族成员可以没有项目覆盖文件；有同名普通文件时才追加，优先级高于家族层。
  if (hasProjectFile) {
    parts.push("---", await readFile(join(projectsDirectory, `${projectName}.md`), "utf8"));
  }

  return parts.join("\n\n");
}
