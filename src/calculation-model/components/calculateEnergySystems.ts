import { IProject, EnergySystem, TCostCurveCategory, TCostCurveType, EnergyCarrier } from "../../types";
import { extractInterpolatedValueFromCurves } from '../utils';

export interface ISystemSize {
  centralized: number;
  decentralized: number[];
}

export interface IEnergySystemScenarioInfo {
  heatingNeed: number;
  individualBuildingHeatNeed: IIndividualBuildingHeatNeed[];
  systemSize: ISystemSize;
  primaryEnergyUse: number;
  emissions: number;
  lifetimeEnergyCost: number;
  investmentCost: Record<TCostCurveType, number>;
  maintenanceCost: Record<TCostCurveType, number>;
  embodiedEnergy: Record<TCostCurveType, number>;
  [key: string]: IEnergySystemScenarioInfo[keyof IEnergySystemScenarioInfo];
}

type TScenarioId = string;
type TEnergySystemId = string;

interface IIndividualBuildingHeatNeed {
  heatingNeed: number;
  numBuildings: number;
}

export const calculateEnergySystems = (project: IProject) => {
  // for each scenario
  let energySystemsInUse: Record<TScenarioId,Record<TEnergySystemId,IEnergySystemScenarioInfo>> = {};
  Object.keys(project.scenarioData.scenarios).forEach((scenarioId) => {
    const scenario = project.scenarioData.scenarios[scenarioId];
    energySystemsInUse[scenarioId] = {};
    // find which energy systems serve which building and what their heat need is
    Object.keys(project.calcData.buildingTypes).forEach(buildingTypeId => {
      const scenarioInfo = project.scenarioData.scenarios[scenarioId].buildingTypes[buildingTypeId];
      
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
          individualBuildingHeatNeed: [{ heatingNeed: buildingTypeHeatNeed, numBuildings: numBuildingsOfType }],
          systemSize: { centralized: 0, decentralized: [] },
          primaryEnergyUse: 0,
          emissions: 0,
          lifetimeEnergyCost: 0,
          investmentCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
          maintenanceCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
          embodiedEnergy: { intake: 0, generation: 0, circulation: 0, substation: 0, },
        };
      } else {
        energySystemsInUse[scenarioId][energySystemId].heatingNeed += totalBuildingTypeHeatNeed;
        energySystemsInUse[scenarioId][energySystemId].individualBuildingHeatNeed.push({ heatingNeed: buildingTypeHeatNeed, numBuildings: numBuildingsOfType });
      }
    });

    const energySystemScenarioInfos = energySystemsInUse[scenarioId];
    // calculate system size
    Object.keys(energySystemScenarioInfos).forEach(energySystemId => {
      const energySystemScenarioInfo = energySystemScenarioInfos[energySystemId];
      const energySystem = project.calcData.energySystems[energySystemId];
      validateEnergySystem(energySystem);
      const { heatingNeed, individualBuildingHeatNeed } = energySystemScenarioInfo;
      const systemSize = calculateSystemSize(energySystem, heatingNeed, individualBuildingHeatNeed);
      energySystemScenarioInfo.systemSize = systemSize;
      energySystemScenarioInfo.maintenanceCost = calculateEnergySystemTotalMaintenanceCost(energySystem, systemSize);
      energySystemScenarioInfo.investmentCost = calculateEnergySystemTotalInvestmentCost(energySystem, systemSize);
      energySystemScenarioInfo.embodiedEnergy = calculateEnergySystemTotalEmbodiedEnergy(energySystem, systemSize);

      const energyCarrierId = energySystem.energyCarrier;
      const energyCarrier = project.calcData.energyCarriers[energyCarrierId];
      energySystemScenarioInfo.primaryEnergyUse = calculateEnergySystemPrimaryEnergyUse(energySystem, energyCarrier, heatingNeed);
      energySystemScenarioInfo.emissions = calculateEnergySystemEmissions(energySystem, energyCarrier, heatingNeed);

      energySystemScenarioInfo.lifetimeEnergyCost = calculateEnergySystemLifetimeEnergyCost(energySystem, energyCarrier, energySystemScenarioInfo.primaryEnergyUse, scenario.economy.energyPriceIncrease);
    });
  });
  return energySystemsInUse;
}

export const calculateSystemSize = (energySystem: EnergySystem, systemHeatingNeed: number, individualBuildingHeatNeed: IIndividualBuildingHeatNeed[]) => {
  const { systemSizeCurves } = energySystem;
  const centralizedHeatingNeedCurve = systemSizeCurves.centralized.heatingNeed.value;
  const centralizedSystemSizeCurve = systemSizeCurves.centralized.systemSize.value;
  
  const substationHeatingNeedCurve = systemSizeCurves.substation.heatingNeed.value;
  const substationSystemSizeCurve = systemSizeCurves.substation.systemSize.value;

  let systemSize: ISystemSize = { centralized: 0, decentralized: [] };
  
  // todo: change calculation method based on system type
  switch(energySystem.systemType) {
    default: {
      systemSize.centralized = extractInterpolatedValueFromCurves(centralizedHeatingNeedCurve, centralizedSystemSizeCurve, systemHeatingNeed);
      individualBuildingHeatNeed.forEach(individualBuilding => {
        for (let i = 0; i < individualBuilding.numBuildings; i++) {
          const heatingNeed = individualBuilding.heatingNeed
          systemSize.decentralized.push(extractInterpolatedValueFromCurves(substationHeatingNeedCurve, substationSystemSizeCurve, heatingNeed))
        }
      });
    }
  }
  return systemSize;
}

export const calculateEnergySystemTotalInvestmentCost = (energySystem: EnergySystem, systemSize: ISystemSize, ) => {
  return calculateEnergySystemTotalCategoryCost("investmentCost", energySystem, systemSize);
}

export const calculateEnergySystemTotalMaintenanceCost = (energySystem: EnergySystem, systemSize: ISystemSize, ) => {
  return calculateEnergySystemTotalCategoryCost("maintenanceCost", energySystem, systemSize);
}

export const calculateEnergySystemTotalEmbodiedEnergy = (energySystem: EnergySystem, systemSize: ISystemSize, ) => {
  return calculateEnergySystemTotalCategoryCost("embodiedEnergy", energySystem, systemSize);
}

const calculateEnergySystemTotalCategoryCost = (category: TCostCurveCategory, energySystem: EnergySystem, systemSize: ISystemSize,) => {
  let costs: Record<TCostCurveType, number> = {
    intake: 0,
    circulation: 0,
    generation: 0,
    substation: 0,
  };
  switch(energySystem.systemCategory) {
    case "decentralized": {
      const decentralizedCost = calculateIndividualEnergySystemCosts(category, energySystem, systemSize.decentralized);
      Object.keys(costs).forEach(key => {
        costs[key as TCostCurveType] += decentralizedCost[key as TCostCurveType];
      });
      break;
    } case "centralized": {
      const centralizedCost = calculateCentralizedEnergySystemCosts(category, energySystem, systemSize.centralized);
      const decentralizedCost = calculateIndividualEnergySystemCosts(category, energySystem, systemSize.decentralized);
      Object.keys(costs).forEach(key => {
        costs[key as TCostCurveType] += centralizedCost[key as TCostCurveType] + decentralizedCost[key as TCostCurveType];
      });
      break;
    } case "none": {
      break;
    } default: {
      throw new Error(`System category ${energySystem.systemCategory} has not been defined.`);
    }
  }
  return costs;
}

export const calculateCentralizedEnergySystemCosts = (type: TCostCurveCategory, energySystem: EnergySystem, systemSize: number, ) => {
  const costCurves = energySystem.costCurves.centralized[type];
  const systemSizeCurve = costCurves.systemSize;
  let costs: Record<TCostCurveType, number> = {
    intake: 0,
    circulation: 0,
    generation: 0,
    substation: 0,
  };
  Object.entries(costCurves).forEach(([id, c]) => {
    if (id === "systemSize") {
      return;
    }
    costs[id as TCostCurveType] += extractInterpolatedValueFromCurves(systemSizeCurve.value, c.value, systemSize);
  });
  return costs;
}

export const calculateIndividualEnergySystemCosts = (type: TCostCurveCategory, energySystem: EnergySystem, systemSizes: number[], ) => {
  const costCurves = energySystem.costCurves.substation[type];
  const systemSizeCurve = costCurves.systemSize;
  let costs: Record<TCostCurveType, number> = {
    intake: 0,
    circulation: 0,
    generation: 0,
    substation: 0,
  };
  systemSizes.forEach(systemSize => {
    costs.substation += extractInterpolatedValueFromCurves(systemSizeCurve.value, costCurves.substation.value, systemSize);
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

export const calculateSpecificValueFromEnergySystemScenarioInfo = (
  energySystemScenarioInfo: IEnergySystemScenarioInfo,
  totalBuildingArea: number,
  key: keyof IEnergySystemScenarioInfo,
) => {
  const out = Object.entries(energySystemScenarioInfo[key]).reduce((memo, [, val]) => {
    return memo + val;
  }, 0);
  return out/(totalBuildingArea);
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

export const calculateEnergySystemPrimaryEnergyUse = (
  energySystem: EnergySystem,
  energyCarrier: EnergyCarrier,
  heatingNeed: number,
) => {
  // todo: check this calculation
  //const primaryEnergyFactor = +energyCarrier.primaryEnergyFactorNonRe + +energyCarrier.primaryEnergyFactorRe;
  const primaryEnergyFactor = +energyCarrier.primaryEnergyFactorTotal;
  return primaryEnergyFactor*heatingNeed/energySystem.efficiency;
}

export const calculateEnergySystemEmissions = (
  energySystem: EnergySystem,
  energyCarrier: EnergyCarrier,
  heatingNeed: number,
) => {
  return energyCarrier.emissionFactor*heatingNeed/energySystem.efficiency;
}

export const calculateEnergySystemLifetimeEnergyCost = (
  energySystem: EnergySystem,
  energyCarrier: EnergyCarrier,
  primaryEnergyUse: number,
  priceIncrease: number,
) => {
  let lifetimeEnergyCost = 0;
  for (let i = 0; i < energySystem.lifeTime; i++) {
    //const energyCost = primaryEnergyUse*energyCarrier.currentPrice*Math.pow(+priceIncrease,i);
    const energyCost = primaryEnergyUse*energyCarrier.projectedPrice;
    lifetimeEnergyCost += energyCost;
  }
  return lifetimeEnergyCost;
}

const validateEnergySystem = (energySystem: EnergySystem) => {
  if (!energySystem.energyCarrier) {
    throw new Error("Energy carrier must be defined for all energy systems.");
  }
  if (!energySystem.lifeTime) {
    throw new Error("Life time must be defined and positive for all energy systems.");
  }
}