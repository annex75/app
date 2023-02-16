import { IProject, EnergySystem, TCostCurveCategory, TCostCurveType, EnergyCarrier, HvacMeasure } from "../../types";
import { extractInterpolatedValueFromCurves } from '../utils';
import { calculateHeatLossCoefficient } from '../calculate';

export interface ISystemSize {
  centralized: number;
  decentralized: IDecentralizedSystemSize[];
}

interface IDecentralizedSystemSize {
  systemSize: number,
  numberOfBuildings: number,
}

export interface IEnergySystemScenarioInfo {
  heatingNeed: number;
  individualBuildingHeatNeed: IBuildingTypeHeatData[];
  systemSize: ISystemSize;
  primaryEnergyUse: number;
  emissions: number;
  lifetimeEnergyCost: number;
  investmentCost: Record<TCostCurveType, number>;
  maintenanceCost: Record<TCostCurveType, number>;
  embodiedEmissions: Record<TCostCurveType, number>;
  [key: string]: IEnergySystemScenarioInfo[keyof IEnergySystemScenarioInfo];
}

type TScenarioId = string;
type TEnergySystemId = string;

interface IBuildingTypeHeatData {
  heatingNeed: number;
  indoorTemperature: number;
  outdoorTemperature: number;
  decentralizedSystemEfficiency: number;
  heatLossCoefficient: number;
  numBuildings: number;
}

export const calculateEnergySystems = (project: IProject) => {
  // for each scenario
  let energySystemsInUse: Record<TScenarioId,Record<TEnergySystemId,IEnergySystemScenarioInfo>> = {};
  Object.keys(project.scenarioData.scenarios).forEach((scenarioId) => {
    const scenario = project.scenarioData.scenarios[scenarioId];
    if (scenario.deleted) return;
    energySystemsInUse[scenarioId] = {};
    // find which energy systems serve which building and what their heat need is
    Object.keys(project.calcData.buildingTypes).forEach(buildingTypeId => {
      const scenarioInfo = project.scenarioData.scenarios[scenarioId].buildingTypes[buildingTypeId];
      const buildingType = project.calcData.buildingTypes[buildingTypeId];
      
      const energySystemId = scenarioInfo.energySystem.energySystem;
      if (!energySystemId) {
        return;
      }

      const energySystem = project.calcData.energySystems[energySystemId];

      if (!energySystem) {
        throw new Error (`Calculation failed: Energy system ${energySystemId} could not be found`);
      }
      
      const buildingTypeHeatNeed = scenarioInfo.buildingType.heatingNeed;

      const buildingTypeHLC = calculateHeatLossCoefficient(project.calcData, buildingTypeId, scenarioInfo);
      const numBuildingsOfType = scenarioInfo.buildingType.numberOfBuildings;
      const totalBuildingTypeHeatNeed = buildingTypeHeatNeed*numBuildingsOfType;

      const hvacMeasure = project.calcData.buildingMeasures.hvac[scenarioInfo.buildingMeasures.hvac.id] as HvacMeasure;

      const buildingTypeHeatData: IBuildingTypeHeatData = { 
        heatingNeed: buildingTypeHeatNeed,
        indoorTemperature: buildingType.buildingThermalProperties.designIndoorTemperature,
        outdoorTemperature: project.calcData.district.climate.designOutdoorTemperature,
        decentralizedSystemEfficiency: hvacMeasure.efficiency,
        heatLossCoefficient: buildingTypeHLC,
        numBuildings: numBuildingsOfType 
      }

      if (!Object.keys(energySystemsInUse[scenarioId]).includes(energySystem.id)) {
        energySystemsInUse[scenarioId][energySystemId] = {
          heatingNeed: totalBuildingTypeHeatNeed,
          individualBuildingHeatNeed: [ buildingTypeHeatData ],
          systemSize: { centralized: 0, decentralized: [] },
          primaryEnergyUse: 0,
          emissions: 0,
          lifetimeEnergyCost: 0,
          investmentCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
          maintenanceCost: { intake: 0, generation: 0, circulation: 0, substation: 0, },
          embodiedEmissions: { intake: 0, generation: 0, circulation: 0, substation: 0, },
        };
      } else {
        energySystemsInUse[scenarioId][energySystemId].heatingNeed += totalBuildingTypeHeatNeed;
        energySystemsInUse[scenarioId][energySystemId].individualBuildingHeatNeed.push(buildingTypeHeatData);
      }
    });

    const energySystemScenarioInfos = energySystemsInUse[scenarioId];
    // calculate system size
    Object.keys(energySystemScenarioInfos).forEach(energySystemId => {
      const energySystemScenarioInfo = energySystemScenarioInfos[energySystemId];
      const energySystem = project.calcData.energySystems[energySystemId];
      validateEnergySystem(energySystem);
      const { heatingNeed, individualBuildingHeatNeed } = energySystemScenarioInfo;
      const systemSize = calculateSystemSize(energySystem, individualBuildingHeatNeed);
      energySystemScenarioInfo.systemSize = systemSize;
      energySystemScenarioInfo.maintenanceCost = calculateEnergySystemTotalMaintenanceCost(energySystem, systemSize);
      energySystemScenarioInfo.investmentCost = calculateEnergySystemTotalInvestmentCost(energySystem, systemSize);
      energySystemScenarioInfo.embodiedEmissions = calculateEnergySystemTotalEmbodiedEmissions(energySystem, systemSize);

      const energyCarrierId = energySystem.energyCarrier;
      const energyCarrier = project.calcData.energyCarriers[energyCarrierId];
      energySystemScenarioInfo.primaryEnergyUse = calculateEnergySystemPrimaryEnergyUse(energySystem, energyCarrier, heatingNeed);
      energySystemScenarioInfo.emissions = calculateEnergySystemEmissions(energySystem, energyCarrier, heatingNeed);

      energySystemScenarioInfo.lifetimeEnergyCost = calculateEnergySystemLifetimeEnergyCost(energySystem, energyCarrier, energySystemScenarioInfo.primaryEnergyUse /*, scenario.economy.energyPriceIncrease*/);
    });
  });
  return energySystemsInUse;
}

const calculateSystemSize = (energySystem: EnergySystem, individualBuildingHeatNeed: IBuildingTypeHeatData[]) => {
  let systemSize: ISystemSize = { centralized: 0, decentralized: [] };
  
  // todo: change calculation method based on system type
  switch(energySystem.systemType) {
    default: {
      const centralEfficiency = energySystem.efficiency;
      
      if (!centralEfficiency) {
        throw new Error("Centralized system efficiency must be positive");
      }
      systemSize.decentralized = individualBuildingHeatNeed.map((heatData) => {
        if (!heatData.decentralizedSystemEfficiency) {
          throw new Error("Decentralized system efficiency must be positive");
        }
        const decentralizedSystemSize = 
          (heatData.indoorTemperature - heatData.outdoorTemperature)
          * heatData.heatLossCoefficient
          / (energySystem.systemCategory === "decentralized" ? energySystem.efficiency : 1)
          / heatData.decentralizedSystemEfficiency
          / 1000; // convert to [kW]
        return {
          systemSize: decentralizedSystemSize,
          numberOfBuildings: heatData.numBuildings,
        };
      });
      systemSize.centralized = energySystem.systemCategory === "centralized" ? systemSize.decentralized.reduce((a, b) => {
        return a + b.systemSize * b.numberOfBuildings;
      }, 0) / centralEfficiency : 0;
    }
  }
  return systemSize;
}

const calculateEnergySystemTotalInvestmentCost = (energySystem: EnergySystem, systemSize: ISystemSize, ) => {
  return calculateEnergySystemTotalCategoryCost("investmentCost", energySystem, systemSize);
}

const calculateEnergySystemTotalMaintenanceCost = (energySystem: EnergySystem, systemSize: ISystemSize, ) => {
  return calculateEnergySystemTotalCategoryCost("maintenanceCost", energySystem, systemSize);
}

const calculateEnergySystemTotalEmbodiedEmissions = (energySystem: EnergySystem, systemSize: ISystemSize, ) => {
  return calculateEnergySystemTotalCategoryCost("embodiedEmissions", energySystem, systemSize);
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

const calculateCentralizedEnergySystemCosts = (type: TCostCurveCategory, energySystem: EnergySystem, systemSize: number, ) => {
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

const calculateIndividualEnergySystemCosts = (type: TCostCurveCategory, energySystem: EnergySystem, systemSizes: IDecentralizedSystemSize[], ) => {
  const costCurves = energySystem.costCurves.substation[type];
  const systemSizeCurve = costCurves.systemSize;
  let costs: Record<TCostCurveType, number> = {
    intake: 0,
    circulation: 0,
    generation: 0,
    substation: 0,
  };
  systemSizes.forEach(systemSize => {
    costs.substation += 
      extractInterpolatedValueFromCurves(systemSizeCurve.value, costCurves.substation.value, systemSize.systemSize)
      * systemSize.numberOfBuildings;
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
  
  if (!totalBuildingArea) {
    throw new Error("Building area must be positive");
  }
  if (!energySystem.lifeTime) {
    throw new Error("Energy system lifetime must be positive");
  }
  return costs/(totalBuildingArea*energySystem.lifeTime);
}

export const calculateEnergySystemSpecificMaintenanceCost = (
  energySystemScenarioInfo: IEnergySystemScenarioInfo,
  totalBuildingArea: number,
) => {
  const costs = Object.entries(energySystemScenarioInfo.maintenanceCost).reduce((memo, [, val]) => {
    return memo + val;
  }, 0);
  
  if (!totalBuildingArea) {
    throw new Error("Building area must be positive");
  }
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
  
  if (!totalBuildingArea) {
    throw new Error("Building area must be positive");
  }
  return out/(totalBuildingArea);
}

const calculateEnergySystemPrimaryEnergyUse = (
  energySystem: EnergySystem,
  energyCarrier: EnergyCarrier,
  heatingNeed: number,
) => {
  // todo: check this calculation
  //const primaryEnergyFactor = +energyCarrier.primaryEnergyFactorNonRe + +energyCarrier.primaryEnergyFactorRe;
  const primaryEnergyFactor = +energyCarrier.primaryEnergyFactorTotal;
  const effectiveEfficiency = energySystem.efficiency * energySystem.coefficientOfPerformance;

  if (!effectiveEfficiency) {
    throw new Error("Energy system efficiency and COP must be positive");
  }

  return primaryEnergyFactor*heatingNeed/effectiveEfficiency;
}

const calculateEnergySystemEmissions = (
  energySystem: EnergySystem,
  energyCarrier: EnergyCarrier,
  heatingNeed: number,
) => {
  const effectiveEfficiency = energySystem.efficiency * energySystem.coefficientOfPerformance

  if (!effectiveEfficiency) {
    throw new Error("Energy system efficiency and COP must be positive");
  }
  
  return energyCarrier.emissionFactor*heatingNeed/effectiveEfficiency;
}

const calculateEnergySystemLifetimeEnergyCost = (
  energySystem: EnergySystem,
  energyCarrier: EnergyCarrier,
  primaryEnergyUse: number,
  //priceIncrease: number,
  mode: string = "projected",
) => {
  let lifetimeEnergyCost = 0;
  for (let i = 0; i < energySystem.lifeTime; i++) {
    let energyCost;
    switch(mode) {
      case "projected":
        energyCost = primaryEnergyUse*energyCarrier.projectedPrice;
        break;
        /*
      case "annualIncrease":
        energyCost = primaryEnergyUse*energyCarrier.currentPrice*Math.pow(+priceIncrease,i);
        break;
        */
      default:
        throw new Error(`Energy cost mode ${mode} is not defined`);
    }
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