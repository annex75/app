// external
import { v4 as uuidv4 } from 'uuid';
import xlsx from 'xlsx';

// internal
import { APP_VERSION } from '../constants';
import { updateFromWorkbook } from '../WorkbookImport';
import { IProject, OverviewData, CalcData, ScenarioData, ScenarioInfo, Scenario, toXlsx, BuildingInformation, BuildingGeometry } from './Data';

export class Project implements IProject {
  appVersion = APP_VERSION;
  id: string = uuidv4();
  name: string;
  owner: string;
  overviewData = new OverviewData();
  calcData = new CalcData();
  scenarioData = new ScenarioData();
  deleted = false;
  timeStamp: number = Date.now();

  static fromIProject(iProject: IProject): Project {
    let project = new this(iProject.name, iProject.owner, false);
    project = Object.assign(project, iProject);
    return project;
  }

  constructor(name: string, owner: string, newScenarios: boolean = true) {
    this.name = name;
    this.owner = owner;

    if (newScenarios) {
      // create scenarios
      const scenarioId = uuidv4();
      for (const buildingTypeId in this.calcData.buildingTypes) {
        let buildingType = this.calcData.buildingTypes[buildingTypeId];
        buildingType.scenarioInfos[scenarioId] = new ScenarioInfo();
      } 
      this.scenarioData.scenarios[scenarioId] = new Scenario(scenarioId);
    }
    
  }

  get jsonData(): IProject {
    return JSON.parse(JSON.stringify(this));
  }
  
  updateFromWorkBook = (workBook: xlsx.WorkBook) => {
    updateFromWorkbook(this, workBook);
    console.log(this);
  }

  // takes an empty workbook and fills it with this project in parsed form
  generateWorkbook = (workBook: xlsx.WorkBook) => {
    if (workBook.Sheets.length) {
      throw new Error("Target workbook must be empty")
    }

    // overview data
    const objKeysOverview = [ "contactInfo", "resultOverview" ];
    const valKeysOverview = [ "toolsInfo", "aboutText" ];
    const wsDataOverview = toXlsx(this.overviewData, objKeysOverview, valKeysOverview);
    const wsOverview = xlsx.utils.json_to_sheet(wsDataOverview, { header: ["key", "value"] });
    xlsx.utils.book_append_sheet(workBook, wsOverview, "Overview data");

    // calc data
    // building types
    const buildingNames = ["key"].concat(Object.keys(this.calcData.buildingTypes)
      .filter(key => !this.calcData.buildingTypes[key].deleted)
      .map(key => {
        return this.calcData.buildingTypes[key].name;
      }));
    let wsDataBuildingTypes : any[][] = [ buildingNames ];

    const objKeysBuildingType = [ "buildingGeometry", "buildingInformation" ];
    const buildingTypeTemplate = this.calcData.buildingTypes[Object.keys(this.calcData.buildingTypes)[0]];
    objKeysBuildingType.forEach(objKey => {
      Object.keys(buildingTypeTemplate[objKey]).forEach(key => {
        wsDataBuildingTypes.push([key]);
      });
    });

    Object.keys(this.calcData.buildingTypes).forEach(buildingTypeKey => {
      const buildingType = this.calcData.buildingTypes[buildingTypeKey];
      if (buildingType.deleted) {
        return;
      }
      let i = 1;
      objKeysBuildingType.forEach(objKey => {
        Object.keys(buildingTypeTemplate[objKey]).forEach(key => {
          const a = buildingType[objKey] as BuildingInformation | BuildingGeometry;
          wsDataBuildingTypes[i].push(a[key]);
          i++;
        });
      })
    });
    
    const wsBuildingTypes = xlsx.utils.aoa_to_sheet(wsDataBuildingTypes);
    xlsx.utils.book_append_sheet(workBook, wsBuildingTypes, "Building types");
    
    // energy systems

    return workBook;

  }

}