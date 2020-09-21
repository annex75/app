import { IProject, TBuildingMeasureCategory, buildingMeasureCategories, IBuildingMeasure } from "../../types";

export interface IBuildingMeasureScenarioInfo {
  refurbishmentCost: number;
  // maintenanceCost: Record<TBuildingMeasureCategory, number>;
  embodiedEnergy: number;
  [key: string]: number;
}

type TScenarioId = string;
type TBuildingMeasureId = string;

export const calculateBuildingMeasures = (project: IProject) => {
  let buildingMeasuresInUse: Record<TScenarioId,Record<TBuildingMeasureCategory,Record<TBuildingMeasureId,IBuildingMeasureScenarioInfo>>> = {};
  
  // find which building measures are applied for which building
  
  Object.keys(project.scenarioData.scenarios).forEach((scenarioId) => {
    buildingMeasuresInUse[scenarioId] = {
      roof: {},
      facade: {},
      foundation: {},
      hvac: {},
      windows: {},
    };
    buildingMeasureCategories.forEach(cat => {
      buildingMeasuresInUse[scenarioId][cat] = {};
      Object.keys(project.calcData.buildingTypes).forEach(buildingTypeId => {
        const buildingType = project.calcData.buildingTypes[buildingTypeId];
        const scenarioInfo = buildingType.scenarioInfos[scenarioId];
        
        const buildingMeasureId = scenarioInfo.buildingMeasures[cat];
        if (!buildingMeasureId) {
          return;
        }
  
        const buildingMeasure = project.calcData.buildingMeasures[cat][buildingMeasureId];
  
        if (!buildingMeasure) {
          throw new Error (`Building measure ${buildingMeasureId} could not be found`);
        }
  
        if (!Object.keys(buildingMeasuresInUse[scenarioId][cat]).includes(buildingMeasure.id)) {
          buildingMeasuresInUse[scenarioId][cat][buildingMeasureId] = {
            refurbishmentCost: 0,
            embodiedEnergy: 0,
          };
        }
      });
      const buildingMeasureScenarioInfos = buildingMeasuresInUse[scenarioId][cat];
      // calculate
      Object.keys(buildingMeasureScenarioInfos).forEach(buildingMeasureId => {
        let buildingMeasureScenarioInfo = buildingMeasureScenarioInfos[buildingMeasureId];
        const buildingMeasure = project.calcData.buildingMeasures[cat][buildingMeasureId];
        buildingMeasureScenarioInfo.refurbishmentCost += +buildingMeasure.refurbishmentCost;
        buildingMeasureScenarioInfo.embodiedEnergy += +buildingMeasure.embodiedEnergy;
      });
    });
  });
  return buildingMeasuresInUse;
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