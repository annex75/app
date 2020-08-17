import { IProject, EnergySystem, TCostCurveCategory, TCostCurveType } from "../../types";
import { extractInterpolatedValueFromCurves } from '../utils';

export interface IEnergySystemScenarioInfo {
  heatingNeed: number;
  systemSize: number;
  investmentCost: Record<TCostCurveType, number>;
  maintenanceCost: Record<TCostCurveType, number>;
  embodiedEnergy: Record<TCostCurveType, number>;
  [key: string]: number | Record<TCostCurveType, number>;
}

type TScenarioId = string;
type TEnergySystemId = string;

export const calculateEnergySystems = (project: IProject) => {
  // for each scenario
  let energySystemsInUse: Record<TScenarioId,Record<TEnergySystemId,IEnergySystemScenarioInfo>> = {};
  Object.keys(project.scenarioData.scenarios).forEach((scenarioId) => {
    // const scenario = project.scenarioData.scenarios[scenarioId];
    energySystemsInUse[scenarioId] = {};
    // find which energy systems serve which building and what their heat need is
    Object.keys(project.calcData.buildingTypes).forEach(buildingTypeId => {
      const buildingType = project.calcData.buildingTypes[buildingTypeId];
      const scenarioInfo = buildingType.scenarioInfos[scenarioId];
      
      const energySystemId = scenarioInfo.energySystem.energySystem;
      if (!energySystemId) {
        return;
      }

      const energySystem = project.calcData.energySystems[energySystemId];

      if (!energySystem) {
        throw new Error (`Calculation failed: Energy system ${energySystemId} could not be found`);
      }
      
      const buildingTypeHeatNeed = scenarioInfo.buildingType.heatingNeed;
      const numBuildingsOfType = scenarioInfo.buildingType.numberOfBuildings;
      const totalBuildingTypeHeatNeed = buildingTypeHeatNeed*numBuildingsOfType;

      if (!Object.keys(energySystemsInUse[scenarioId]).includes(energySystem.id)) {
        energySystemsInUse[scenarioId][energySystemId] = {
          heatingNeed: totalBuildingTypeHeatNeed,
          systemSize: -1,
          investmentCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
          maintenanceCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
          embodiedEnergy: { intake: 0, generation: 0, circulation: 0, substation: 0, },
        };
      } else {
        energySystemsInUse[scenarioId][energySystemId].heatingNeed += totalBuildingTypeHeatNeed;
      }
    });

    
    const energySystemScenarioInfos = energySystemsInUse[scenarioId];
    // calculate system size
    Object.keys(energySystemScenarioInfos).forEach(energySystemId => {
      const energySystemScenarioInfo = energySystemScenarioInfos[energySystemId];
      const energySystem = project.calcData.energySystems[energySystemId];
      const heatingNeed = energySystemScenarioInfo.heatingNeed;
      const systemSize = calculateSystemSize(energySystem, heatingNeed);
      energySystemScenarioInfo.systemSize = systemSize;
      energySystemScenarioInfo.maintenanceCost = calculateEnergySystemTotalMaintenanceCost(energySystem, systemSize);
      energySystemScenarioInfo.investmentCost = calculateEnergySystemTotalInvestmentCost(energySystem, systemSize);
      energySystemScenarioInfo.embodiedEnergy = calculateEnergySystemTotalEmbodiedEnergy(energySystem, systemSize);
    });
  });
  return energySystemsInUse;
}

export const calculateSystemSize = (energySystem: EnergySystem, heatingNeed: number) => {
  const { systemSizeCurves } = energySystem;
  const heatingNeedCurve = systemSizeCurves.heatingNeed.value;
  const systemSizeCurve = systemSizeCurves.systemSize.value;
  
  let systemSize = extractInterpolatedValueFromCurves(heatingNeedCurve, systemSizeCurve, heatingNeed);
  
  // todo: change calculation method based on system type
  switch(energySystem.systemType) {
    default: {
      return systemSize;
    }
  }
}

export const calculateEnergySystemTotalInvestmentCost = (energySystem: EnergySystem, systemSize: number, ) => {
  return calculateEnergySystemCosts("investmentCost", energySystem, systemSize);
}

export const calculateEnergySystemTotalMaintenanceCost = (energySystem: EnergySystem, systemSize: number, ) => {
  return calculateEnergySystemCosts("maintenanceCost", energySystem, systemSize);
}

export const calculateEnergySystemTotalEmbodiedEnergy = (energySystem: EnergySystem, systemSize: number, ) => {
  return calculateEnergySystemCosts("embodiedEnergy", energySystem, systemSize);
}

interface IEnergySystemComponentCosts {
  intake: number;
}

export const calculateEnergySystemCosts = (type: TCostCurveCategory, energySystem: EnergySystem, systemSize: number, ) => {
  const costCurves = energySystem.costCurves[type];
  const systemSizeCurve = costCurves.systemSize;
  let costs: Record<TCostCurveType, number> = {
    intake: 0,
    circulation: 0,
    substation: 0,
    generation: 0,
  };
  Object.entries(costCurves).forEach(([id, c]) => {
    if (id === "systemSize") {
      return;
    }
    costs[id as TCostCurveType] += extractInterpolatedValueFromCurves(systemSizeCurve.value, c.value, systemSize);
  });
  return costs;
}

export const calculateEnergySystemAnnualizedSpecificInvestmentCost = (
  energySystemScenarioInfo: IEnergySystemScenarioInfo,
  energySystem: EnergySystem,
  totalBuildingArea: number,
) => {
  const costs = Object.entries(energySystemScenarioInfo.investmentCost).reduce((memo, [, val]) => {
    return memo + val;
  }, 0);
  return costs/(totalBuildingArea*energySystem.lifeTime);
}

export const calculateEnergySystemSpecificMaintenanceCost = (
  energySystemScenarioInfo: IEnergySystemScenarioInfo,
  energySystem: EnergySystem,
  totalBuildingArea: number,
) => {
  const costs = Object.entries(energySystemScenarioInfo.maintenanceCost).reduce((memo, [, val]) => {
    return memo + val*energySystem.lifeTime;
  }, 0);
  return costs/(totalBuildingArea)
}

export const calculateEnergySystemSpecificEmbodiedEnergy = (
  energySystemScenarioInfo: IEnergySystemScenarioInfo,
  totalBuildingArea: number,
) => {
  const embodiedEnergy = Object.entries(energySystemScenarioInfo.embodiedEnergy).reduce((memo, [, val]) => {
    return memo + val;
  }, 0);
  return embodiedEnergy/(totalBuildingArea);
}
