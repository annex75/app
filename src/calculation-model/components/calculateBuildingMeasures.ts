import { IProject, IBuildingMeasure, TBuildingMeasureScenarioCategory, buildingMeasureScenarioCategories, IScenarioEnvelopeMeasureData, IScenarioFoundationMeasureData, convertTypes, TBuildingMeasureCategory, BuildingType, ScenarioInfo, EnvelopeMeasure, WindowMeasure, CalcData, HvacMeasure, getBuildingArea, getBuildingFoundationArea } from "../../types";

export interface IBuildingMeasureScenarioInfo {
  renovationCost: number;
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
        const buildingType = project.calcData.buildingTypes[buildingTypeId];
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
            const { thickness } = scenarioInfo.buildingMeasures[scenarioCat] as IScenarioEnvelopeMeasureData;
            const area = getBuildingArea(buildingType.buildingGeometry, scenarioCat);
            const volume = thickness * area;
            factor = volume * numBuildings;
            break; 
          } case "foundation": {
            const { wallThickness, floorThickness } = scenarioInfo.buildingMeasures[scenarioCat] as IScenarioFoundationMeasureData;
            const areas = getBuildingFoundationArea(buildingType.buildingGeometry);
            const volume = wallThickness*areas.wall + floorThickness*areas.floor;
            factor = volume * numBuildings;
            break;
          } case "windows": {
            const area = getBuildingArea(buildingType.buildingGeometry, scenarioCat);
            factor = area * numBuildings;
            break;
          } case "hvac" : {
            factor = numBuildings;
            break;
          } default: {
            throw new Error(`${scenarioCat} has not been defined`);
          }
        }
        const cost = buildingMeasure.renovationCost * factor;
        const embodiedEnergy = buildingMeasure.embodiedEnergy * factor;

        if (!Object.keys(buildingMeasuresInUse[scenarioId][scenarioCat]).includes(buildingMeasure.id)) {
          buildingMeasuresInUse[scenarioId][scenarioCat][buildingMeasureId] = {
            renovationCost: cost,
            embodiedEnergy: embodiedEnergy,
          };
        } else {
          buildingMeasuresInUse[scenarioId][scenarioCat][buildingMeasureId].renovationCost += cost;
          buildingMeasuresInUse[scenarioId][scenarioCat][buildingMeasureId].embodiedEnergy += embodiedEnergy;
        }
      });
    });
  });
  return buildingMeasuresInUse;
}

export const calculateBuildingMeasureAnnualizedSpecificRenovationCost = (
  buildingMeasureScenarioInfo: IBuildingMeasureScenarioInfo,
  buildingMeasure: IBuildingMeasure,
  totalBuildingArea: number,
) => {
  if (!totalBuildingArea) {
    throw new Error("Building area must be positive");
  }
  if (!buildingMeasure.lifeTime) {
    throw new Error("Measure lifetime must be positive");
  }
  return buildingMeasureScenarioInfo.renovationCost/(totalBuildingArea*buildingMeasure.lifeTime);
}

export const calculateBuildingMeasureSpecificEmbodiedEnergy = (
  buildingMeasureScenarioInfo: IBuildingMeasureScenarioInfo,
  totalBuildingArea: number,
) => {
  if (!totalBuildingArea) {
    throw new Error("Building area must be positive");
  }
  return buildingMeasureScenarioInfo.embodiedEnergy/(totalBuildingArea);
}


// calculates the resulting u-value of this with additional insulation
export const calculateHeatLossCoefficient = (calcData: CalcData, buildingTypeId: string, scenarioInfo: ScenarioInfo) => {
  const buildingType = calcData.buildingTypes[buildingTypeId];
  const buildingMeasures = {
    facade: calcData.buildingMeasures.insulation[scenarioInfo.buildingMeasures.facade.id] as EnvelopeMeasure,
    roof: calcData.buildingMeasures.insulation[scenarioInfo.buildingMeasures.roof.id] as EnvelopeMeasure,
    foundation: calcData.buildingMeasures.insulation[scenarioInfo.buildingMeasures.foundation.id] as EnvelopeMeasure,
    windows: calcData.buildingMeasures.windows[scenarioInfo.buildingMeasures.windows.id] as WindowMeasure,
    hvac: calcData.buildingMeasures.hvac[scenarioInfo.buildingMeasures.hvac.id] as HvacMeasure,
  };

  const calcArr: IUValueCalcObj[] = [
    {
      rBase: 1/buildingType.buildingThermalProperties.facadeUValue,
      lambdaAddtl: buildingMeasures.facade.lambdaValue,
      thicknessAddtl: (scenarioInfo.buildingMeasures.facade as IScenarioEnvelopeMeasureData).thickness/100,
      area: getBuildingArea(buildingType.buildingGeometry, "facade"),
    },{
      rBase: 1/buildingType.buildingThermalProperties.roofUValue,
      lambdaAddtl: buildingMeasures.roof.lambdaValue,
      thicknessAddtl: (scenarioInfo.buildingMeasures.roof as IScenarioEnvelopeMeasureData).thickness/100,
      area: getBuildingArea(buildingType.buildingGeometry, "roof"),
    },{
      rBase: 1/buildingType.buildingThermalProperties.foundationUValue,
      lambdaAddtl: buildingMeasures.foundation.lambdaValue,
      thicknessAddtl: (scenarioInfo.buildingMeasures.foundation as IScenarioFoundationMeasureData).floorThickness/100,
      area: getBuildingFoundationArea(buildingType.buildingGeometry).floor,
    },{
      rBase: 1/buildingType.buildingThermalProperties.basementWallUValue,
      lambdaAddtl: buildingMeasures.foundation.lambdaValue,
      thicknessAddtl: (scenarioInfo.buildingMeasures.foundation as IScenarioFoundationMeasureData).wallThickness/100,
      area: getBuildingFoundationArea(buildingType.buildingGeometry).wall,
    },
  ];

  const windows = {
    uValue: buildingMeasures.windows.uValue,
    area: getBuildingArea(buildingType.buildingGeometry, "windows"),
  }

  const envelopeHeatLossCoefficient = hlc(calcArr, windows);
  const thermalBridges = calculateThermalBridges(buildingType);
  const ventilationLosses = calculateVentilationLosses(buildingType, buildingMeasures.hvac, calcData.district.location.altitude)
  return envelopeHeatLossCoefficient + thermalBridges + ventilationLosses;
}

interface IUValueCalcObj {
  rBase: number,
  lambdaAddtl: number,
  thicknessAddtl: number,
  area: number,
}

interface IUValueWindowObj {
  uValue: number,
  area: number,
}


// heat loss coefficient
const hlc = (calcArr: IUValueCalcObj[], windows: IUValueWindowObj) => {
  const uValuesTimesArea = calcArr.map(o => {
    const rAddtl = o.thicknessAddtl/o.lambdaAddtl;
    return o.area/(o.rBase + rAddtl);
  });
  const totalHLC = uValuesTimesArea.reduce((a, b) => a + b, 0) + windows.area*windows.uValue;
  return totalHLC;
}

// conservative values collected from BIMEnergy database
// [W/m,K]
const psiValues = {
  exteriorWallExteriorWall: 0.2,
  exteriorWallInteriorFloor: 0.2,
  windows: 0.04,
  exteriorWallRoof: 0.14,
  exteriorWallFoundation: 0.26,
}

// calculates heat loss coefficient of thermal bridges
// todo: calculate this based on user inputs
// todo: include further thermal bridges
const calculateThermalBridges = (buildingType: BuildingType) => {
  // assume rectangular building here
  const exteriorWallExteriorWall = 
    psiValues.exteriorWallExteriorWall
    * buildingType.buildingGeometry.floorHeight
    * buildingType.buildingGeometry.numberOfFloorsAbove
    * 4;
  
  // assume all floors have the same perimeter
  const exteriorWallInteriorFloor = 
    psiValues.exteriorWallInteriorFloor
    * (buildingType.buildingGeometry.numberOfFloorsAbove - 1)
    * buildingType.buildingGeometry.perimeter;

  // assume all windows are square
  const windows =
    psiValues.windows 
    * Math.sqrt(getBuildingArea(buildingType.buildingGeometry, "windows"))
    * 4;
  
  const exteriorWallRoof =
    psiValues.exteriorWallRoof
    * buildingType.buildingGeometry.perimeter;

  const exteriorWallFoundation =
    psiValues.exteriorWallFoundation
    * buildingType.buildingGeometry.perimeter;


  return exteriorWallExteriorWall + exteriorWallInteriorFloor + windows + exteriorWallRoof + exteriorWallFoundation;
}

const calculateVentilationLosses = (buildingType: BuildingType, hvacMeasure: HvacMeasure, altitude: number) => {
  const heatStorageCapacity = 1220 - 0.14 * altitude;
  const airFlow = hvacMeasure.ventilationRate * buildingType.buildingGeometry.heatedVolume;
  const ventilationLosses = (heatStorageCapacity * airFlow)/3600;
  return ventilationLosses;
}