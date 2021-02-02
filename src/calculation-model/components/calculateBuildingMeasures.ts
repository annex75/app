import { IProject, IBuildingMeasure, TBuildingMeasureScenarioCategory, buildingMeasureScenarioCategories, IScenarioEnvelopeMeasureData, IScenarioFoundationMeasureData, IScenarioWindowsMeasureData, convertTypes, TBuildingMeasureCategory } from "../../types";

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
    buildingMeasureScenarioCategories.forEach(scenarioCat => {
      buildingMeasuresInUse[scenarioId][scenarioCat] = {};
      Object.keys(project.calcData.buildingTypes).forEach(buildingTypeId => {
        const scenarioInfo = project.scenarioData.scenarios[scenarioId].buildingTypes[buildingTypeId];
        const numBuildings = scenarioInfo.buildingType.numberOfBuildings;
        
        const buildingMeasureId = scenarioInfo.buildingMeasures[scenarioCat].id;
        if (!buildingMeasureId) {
          return;
        }
        
        let cat = convertTypes("TBuildingMeasureScenarioCategory", "TBuildingMeasureCategory", scenarioCat) as TBuildingMeasureCategory;

        const buildingMeasure = project.calcData.buildingMeasures[cat][buildingMeasureId];
  
        if (!buildingMeasure) {
          throw new Error (`Building measure ${buildingMeasureId} could not be found`);
        }
        
        let factor = 0;
        switch(scenarioCat) {
          case "facade":
          case "roof":
          {
            const { thickness, area } = scenarioInfo.buildingMeasures[scenarioCat] as IScenarioEnvelopeMeasureData;
            const volume = thickness * area;
            factor = volume * numBuildings;
            break;
          } case "foundation": {
            const { wallThickness, wallArea, floorThickness, floorArea } = scenarioInfo.buildingMeasures[scenarioCat] as IScenarioFoundationMeasureData;
            const volume = wallThickness*wallArea + floorThickness*floorArea;
            factor = volume * numBuildings;
            break;
          } case "windows":  {
            const area = (scenarioInfo.buildingMeasures[scenarioCat] as IScenarioWindowsMeasureData).area;
            factor = area * numBuildings;
            break;
          } case "hvac" : {
            factor = numBuildings;
            break;
          } default: {
            throw new Error(`${scenarioCat} has not been defined`);
          }
        }

        const cost = buildingMeasure.refurbishmentCost * factor;
        const embodiedEnergy = buildingMeasure.embodiedEnergy * factor;

        if (!Object.keys(buildingMeasuresInUse[scenarioId][scenarioCat]).includes(buildingMeasure.id)) {
          buildingMeasuresInUse[scenarioId][scenarioCat][buildingMeasureId] = {
            refurbishmentCost: cost,
            embodiedEnergy: embodiedEnergy,
          };
        } else {
          buildingMeasuresInUse[scenarioId][scenarioCat][buildingMeasureId].refurbishmentCost += cost;
          buildingMeasuresInUse[scenarioId][scenarioCat][buildingMeasureId].embodiedEnergy += embodiedEnergy;
        }
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