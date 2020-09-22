import { IProject, IBuildingMeasure, TBuildingMeasureScenarioCategory, buildingMeasureScenarioCategories, IScenarioEnvelopeMeasureData, IScenarioFoundationMeasureData, IScenarioWindowsMeasureData } from "../../types";

export interface IBuildingMeasureScenarioInfo {
  refurbishmentCost: number;
  // maintenanceCost: Record<TBuildingMeasureCategory, number>;
  embodiedEnergy: number;
  [key: string]: number;
}

type TScenarioId = string;
type TBuildingMeasureId = string;

export const calculateBuildingMeasures = (project: IProject) => {
  let buildingMeasuresInUse: Record<TScenarioId,Record<TBuildingMeasureScenarioCategory,Record<TBuildingMeasureId,IBuildingMeasureScenarioInfo>>> = {};
  
  // find which building measures are applied for which building
  
  Object.keys(project.scenarioData.scenarios).forEach((scenarioId) => {
    buildingMeasuresInUse[scenarioId] = {
      facade: {},
      roof: {},
      foundation: {},
      hvac: {},
      windows: {},
    };
    buildingMeasureScenarioCategories.forEach(cat => {
      buildingMeasuresInUse[scenarioId][cat] = {};
      Object.keys(project.calcData.buildingTypes).forEach(buildingTypeId => {
        const buildingType = project.calcData.buildingTypes[buildingTypeId];
        const scenarioInfo = buildingType.scenarioInfos[scenarioId];
        const numBuildings = scenarioInfo.buildingType.numberOfBuildings;
        
        const buildingMeasureId = scenarioInfo.buildingMeasures[cat].id;
        if (!buildingMeasureId) {
          return;
        }
  
        const buildingMeasure = project.calcData.buildingMeasures[cat][buildingMeasureId];
  
        if (!buildingMeasure) {
          throw new Error (`Building measure ${buildingMeasureId} could not be found`);
        }
        
        let factor = 0;
        switch(cat) {
          case "facade":
          case "roof":
          {
            const { thickness, area } = scenarioInfo.buildingMeasures[cat] as IScenarioEnvelopeMeasureData;
            const volume = thickness * area;
            factor = volume * numBuildings;
            break;
          } case "foundation": {
            const { wallThickness, wallArea, floorThickness, floorArea } = scenarioInfo.buildingMeasures[cat] as IScenarioFoundationMeasureData;
            const volume = wallThickness*wallArea + floorThickness*floorArea;
            factor = volume * numBuildings;
            break;
          } case "windows":  {
            const area = (scenarioInfo.buildingMeasures[cat] as IScenarioWindowsMeasureData).area;
            factor = area * numBuildings;
            break;
          } case "hvac" : {
            factor = numBuildings;
            break;
          } default: {
            throw new Error(`${cat} has not been defined`);
          }
        }

        const cost = buildingMeasure.refurbishmentCost * factor;
        const embodiedEnergy = buildingMeasure.embodiedEnergy * factor;

        if (!Object.keys(buildingMeasuresInUse[scenarioId][cat]).includes(buildingMeasure.id)) {
          buildingMeasuresInUse[scenarioId][cat][buildingMeasureId] = {
            refurbishmentCost: cost,
            embodiedEnergy: 0,
          };
        } else {
          buildingMeasuresInUse[scenarioId][cat][buildingMeasureId].refurbishmentCost += cost;
          buildingMeasuresInUse[scenarioId][cat][buildingMeasureId].embodiedEnergy += embodiedEnergy;
        }
      });
    });
  });
  return buildingMeasuresInUse;
}

export const calculateBuildingMeasureRefurbishingCost = (buildingMeasure: IBuildingMeasure) => {
  switch(buildingMeasure.category) {
    case "insulation": {
      return 0;
    } case "windows":  {
      return 0;
    } case "hvac" : {
      return 0;
    } default: {
      throw new Error(`${buildingMeasure.category} has not been defined`);
    }
  }
}

export const calculateBuildingMeasureAnnualizedSpecificRefurbishmentCost = (
  buildingMeasureScenarioInfo: IBuildingMeasureScenarioInfo,
  buildingMeasure: IBuildingMeasure,
  totalBuildingArea: number,
) => {
  return buildingMeasureScenarioInfo.refurbishmentCost/(totalBuildingArea*buildingMeasure.lifeTime);
}

export const calculateBuildingMeasureSpecificEmbodiedEnergy = (
  buildingMeasureScenarioInfo: IBuildingMeasureScenarioInfo,
  totalBuildingArea: number,
) => {
  return buildingMeasureScenarioInfo.embodiedEnergy/(totalBuildingArea);
}