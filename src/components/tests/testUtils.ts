import { IProject, OverviewData } from "../../types"
import uuid from "uuid"

export const noop = (s: any) => {

}

export const generateDefaultProject = (): IProject => {
    const defProject = {
        id: uuid(),
        name: "Default project",
        owner: "defaultOwner",
        overviewData: new OverviewData(),
        deleted: false,
    };
    return defProject;
}