import * as xlsx from 'xlsx';
import { IProject, Project } from "./types";

// todo: this should probably be in the data module
export const exportXlsx = (project: IProject) => {
  const exportProject = Project.fromIProject(project);
  let workBook = xlsx.utils.book_new();
  const exportWorkBook = exportProject.generateWorkbook(workBook);
  xlsx.writeFile(exportWorkBook, `${exportProject.name}.xlsb`);
}