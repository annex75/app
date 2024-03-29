import { cloneDeep } from 'lodash';

import {
  calculateBuildingMeasures,
  calculateBuildingMeasureAnnualizedSpecificRenovationCost,
  calculateBuildingMeasureSpecificEmbodiedEmissions,
  calculateHeatLossCoefficient,
  calculateEnergySystems,
  calculateEnergySystemAnnualizedSpecificInvestmentCost,
  calculateEnergySystemSpecificMaintenanceCost,
  calculateSpecificValueFromEnergySystemScenarioInfo,
} from '../calculate'

import { IEnergySystemScenarioInfo } from '../components/calculateEnergySystems';

import { Project, BuildingType, Scenario, ScenarioInfo, EnvelopeMeasure, WindowMeasure, HvacMeasure, IScenarioBuildingMeasureData, IScenarioFoundationMeasureData, IScenarioEnvelopeMeasureData, EnergySystem, EnergyCarrier, TCostCurveType, CostCurveIndividual, CostCurveCentralized  } from '../../types'

const insulationMeasureA = new EnvelopeMeasure("insulation", "insulationA");
insulationMeasureA.renovationCost = 10;
insulationMeasureA.lifeTime = 25;
insulationMeasureA.lambdaValue = 0.036;
insulationMeasureA.embodiedEmissions = 5;

const windowMeasureA = new WindowMeasure("windows", "windowA");
windowMeasureA.renovationCost = 20;
windowMeasureA.lifeTime = 25;
windowMeasureA.uValue = 0.5;
windowMeasureA.embodiedEmissions = 10;

const hvacMeasureA = new HvacMeasure("hvac", "hvacA");
hvacMeasureA.renovationCost = 200;
hvacMeasureA.lifeTime = 25;
hvacMeasureA.embodiedEmissions = 100;
hvacMeasureA.efficiency = 0.9;

const project = new Project("project", "owner", false);

const scenarioInfo = new ScenarioInfo();
scenarioInfo.buildingType.numberOfBuildings = 3;

scenarioInfo.buildingMeasures["facade"] = {
  id: insulationMeasureA.id,
  thickness: 0.23,
} as IScenarioEnvelopeMeasureData;

scenarioInfo.buildingMeasures["roof"] = {
  id: insulationMeasureA.id,
  thickness: 0.14,
} as IScenarioEnvelopeMeasureData;

scenarioInfo.buildingMeasures["foundation"] = {
  id: insulationMeasureA.id,
  wallThickness: 0.11,
  floorThickness: 0.13,
} as IScenarioFoundationMeasureData;

scenarioInfo.buildingMeasures["windows"] = {
  id: windowMeasureA.id,
} as IScenarioBuildingMeasureData;

scenarioInfo.buildingMeasures["hvac"] = {
  id: hvacMeasureA.id,
} as IScenarioBuildingMeasureData;


scenarioInfo.buildingType.heatingNeed = 75;

const buildingTypeId = "buildingTypeA";
const buildingType = new BuildingType(buildingTypeId);
buildingType.buildingGeometry.facadeAreaE = 50;
buildingType.buildingGeometry.facadeAreaN = 50;
buildingType.buildingGeometry.facadeAreaW = 50;
buildingType.buildingGeometry.facadeAreaS = 50;
buildingType.buildingGeometry.windowAreaE = 25;
buildingType.buildingGeometry.windowAreaN = 25;
buildingType.buildingGeometry.windowAreaW = 25;
buildingType.buildingGeometry.windowAreaS = 25;
buildingType.buildingGeometry.roofArea = 100;
buildingType.buildingGeometry.basementFloorArea = 100;
buildingType.buildingGeometry.basementWallArea = 100;
buildingType.buildingGeometry.perimeter = 40;
buildingType.buildingGeometry.numberOfFloorsAbove = 2;

buildingType.buildingThermalProperties.facadeUValue = 0.5;
buildingType.buildingThermalProperties.roofUValue = 0.3;
buildingType.buildingThermalProperties.foundationUValue = 0.2;
buildingType.buildingThermalProperties.basementWallUValue = 0.2;

project.calcData.buildingTypes = { [buildingTypeId]: buildingType };
project.calcData.buildingMeasures["insulation"][insulationMeasureA.id] = insulationMeasureA;
project.calcData.buildingMeasures["windows"][windowMeasureA.id] = windowMeasureA;
project.calcData.buildingMeasures["hvac"][hvacMeasureA.id] = hvacMeasureA;

const energyCarrierId = "energyCarrierA"
const energyCarrierA = new EnergyCarrier(energyCarrierId);
energyCarrierA.primaryEnergyFactorRe = 25;
energyCarrierA.primaryEnergyFactorNonRe = 75;
energyCarrierA.primaryEnergyFactorTotal = 100;
energyCarrierA.emissionFactor = 7;
energyCarrierA.currentPrice = 1.1;
energyCarrierA.projectedPrice = 1.5;
project.calcData.energyCarriers[energyCarrierId] = energyCarrierA;

const energySystemId = "energySystemA"
const energySystemA = new EnergySystem(energySystemId);
energySystemA.systemType = "";
energySystemA.systemCategory = "centralized";
energySystemA.lifeTime = 25;
energySystemA.energyCarrier = energyCarrierId;
energySystemA.efficiency = 0.8;
energySystemA.coefficientOfPerformance = 2;
project.calcData.energySystems[energySystemId] = energySystemA;

const costCurvesIndividual = {
  systemSize: [ 1, 2, 3, 4, 5 ],
  substation: [ 1, 2, 3, 4, 5 ],
}

const costCurvesCentralized = {
  systemSize: [ 5, 10, 15, 20, 25 ],
  intake: [ 5, 10, 15, 20, 25 ],
  generation: [ 5, 10, 15, 20, 25 ],
  circulation: [ 5, 10, 15, 20, 25 ],
}

energySystemA.costCurves.substation = {
  investmentCost: new CostCurveIndividual("euro", costCurvesIndividual),
  maintenanceCost: new CostCurveIndividual("euroPerYear", costCurvesIndividual),
  embodiedEmissions: new CostCurveIndividual("kiloGramCO2EqPerYear", costCurvesIndividual),
}

energySystemA.costCurves.centralized = {
  investmentCost: new CostCurveCentralized("euro", costCurvesCentralized),
  maintenanceCost: new CostCurveCentralized("euroPerYear", costCurvesCentralized),
  embodiedEmissions: new CostCurveCentralized("kiloGramCO2EqPerYear", costCurvesCentralized),
}

scenarioInfo.energySystem.energySystem = energySystemId;

const scenarioId = "scenarioA";
const scenario = new Scenario(scenarioId);

scenario.buildingTypes[buildingTypeId] = scenarioInfo;

project.scenarioData.scenarios[scenarioId] = scenario;

const systemInfo: IEnergySystemScenarioInfo = {
  heatingNeed: 750,
  individualBuildingHeatNeed: [{ 
    heatingNeed: 250,
    numBuildings: 3,
    indoorTemperature: 20,
    outdoorTemperature: -10,
    decentralizedSystemEfficiency: 0.90,
    heatLossCoefficient: 0.3,
  }],
  systemSize: { 
    centralized: 100,
    decentralized: [],
  },
  primaryEnergyUse: 5000,
  emissions: 1000,
  lifetimeEnergyCost: 10000,
  investmentCost: {
    substation: 2500,
    intake: 2500,
    circulation: 2500,
    generation: 2500,
  },
  maintenanceCost: {
    substation: 100,
    intake: 100,
    circulation: 100,
    generation: 100,
  },
  embodiedEmissions: {
    substation: 2500,
    intake: 2500,
    circulation: 2500,
    generation: 2500,
  },
};

const energySystemB = cloneDeep(energySystemA);
const energySystemIdB = "energySystemB"
energySystemB.id = energySystemIdB;
energySystemB.efficiency = 0.95;
energySystemB.systemCategory = "decentralized";
project.calcData.energySystems[energySystemIdB] = energySystemB;

const scenarioB = cloneDeep(scenario);
const scenarioIdB = "ScenarioB"
scenarioB.id = scenarioIdB;
const scenarioInfoB = cloneDeep(scenarioInfo);
scenarioInfoB.energySystem.energySystem = energySystemIdB;

scenarioB.buildingTypes[buildingTypeId] = scenarioInfoB;

project.scenarioData.scenarios[scenarioIdB] = scenarioB;


describe('calculateBuildingMeasures', () => {
  it('calculates building measures', () => {
    // GIVEN
    
    // WHEN
    const result = calculateBuildingMeasures(project);

    // THEN
    expect(result[scenarioId].facade[insulationMeasureA.id].renovationCost).toBeCloseTo(690);
    expect(result[scenarioId].facade[insulationMeasureA.id].embodiedEmissions).toBeCloseTo(345);
    expect(result[scenarioId].roof[insulationMeasureA.id].renovationCost).toBeCloseTo(420);
    expect(result[scenarioId].roof[insulationMeasureA.id].embodiedEmissions).toBeCloseTo(210);
    expect(result[scenarioId].foundation[insulationMeasureA.id].renovationCost).toBeCloseTo(720);
    expect(result[scenarioId].foundation[insulationMeasureA.id].embodiedEmissions).toBeCloseTo(360);
    expect(result[scenarioId].windows[windowMeasureA.id].renovationCost).toBeCloseTo(6000);
    expect(result[scenarioId].windows[windowMeasureA.id].embodiedEmissions).toBeCloseTo(3000);
    expect(result[scenarioId].hvac[hvacMeasureA.id].renovationCost).toBeCloseTo(600);
    expect(result[scenarioId].hvac[hvacMeasureA.id].embodiedEmissions).toBeCloseTo(300);
  });
});

describe('calculateBuildingMeasureAnnualizedSpecificRenovationCost', () => {
  it('calculates annualized specific cost correctly', () => {
    // GIVEN
    const buildingArea = 1000;
    const measureInfo = {
      renovationCost: 50000,
      embodiedEmissions: 25000,
    }

    // WHEN
    const result = calculateBuildingMeasureAnnualizedSpecificRenovationCost(measureInfo, insulationMeasureA, buildingArea);

    // THEN
    expect(result).toBeCloseTo(2);
  });
});

describe('calculateBuildingMeasureSpecificEmbodiedEmissions', () => {
  it('calculates specific embodied emissions correctly', () => {
    // GIVEN
    const buildingArea = 1000;
    const measureInfo = {
      renovationCost: 50000,
      embodiedEmissions: 25000,
    }

    // WHEN
    const result = calculateBuildingMeasureSpecificEmbodiedEmissions(measureInfo, buildingArea);

    // THEN
    expect(result).toBeCloseTo(25);
  });
});

describe('calculateHeatLossCoefficient', () => {
  it('calculates the heat loss coefficient correctly', () => {
    // GIVEN
    
    // WHEN
    const hlc = calculateHeatLossCoefficient(project.calcData, buildingTypeId, scenarioInfo);
    // THEN
    // todo: haven't double checked this value, might be wrong
    expect(hlc).toBeCloseTo(193.44);
  });

  it('detects faulty indata', () => {
    
  });
});

/*
describe('calculateThermalBridges', () => {
  
  it('calculates the psi-value times thermal bridge length correctly', () => {
    // GIVEN
    
    // WHEN
    const tbValue = calculateThermalBridges(buildingType);
    // THEN
    // todo: haven't double checked this value, might be wrong
    expect(tbValue).toBeCloseTo(25.6);
  });
});
*/

describe('calculateEnergySystems', () => {
  it('calculates energy systems', () => {
    // GIVEN
    

    // WHEN
    const result = calculateEnergySystems(project)[scenarioId][energySystemId];

    // THEN
    expect(result.systemSize.centralized).toBeCloseTo(16.12);
    expect(result.systemSize.decentralized.length).toEqual(1);
    expect(result.systemSize.decentralized[0].systemSize).toBeCloseTo(4.298);
    expect(result.systemSize.decentralized[0].numberOfBuildings).toEqual(3);
    Object.keys(result.maintenanceCost).forEach(key => {
      const exp = key === "substation" ? 12.896: 16.12;
      expect(result.maintenanceCost[key as TCostCurveType]).toBeCloseTo(exp);
    });
    Object.keys(result.investmentCost).forEach(key => {
      const exp = key === "substation" ? 12.896: 16.12;
      expect(result.investmentCost[key as TCostCurveType]).toBeCloseTo(exp);
    });
    Object.keys(result.embodiedEmissions).forEach(key => {
      const exp = key === "substation" ? 12.896: 16.12;
      expect(result.embodiedEmissions[key as TCostCurveType]).toBeCloseTo(exp);
    });
    expect(result.primaryEnergyUse).toEqual(28125/energySystemA.coefficientOfPerformance);
    expect(result.lifetimeEnergyCost).toEqual(1054687.5/energySystemA.coefficientOfPerformance);
    expect(result.emissions).toEqual(1968.75/energySystemA.coefficientOfPerformance);
  });

  it('calculates energy decentralized systems', () => {
    // GIVEN
    

    // WHEN
    const result = calculateEnergySystems(project)[scenarioIdB][energySystemIdB];

    // THEN
    expect(result.systemSize.centralized).toEqual(0);
    expect(result.systemSize.decentralized.length).toEqual(1);
    expect(result.systemSize.decentralized[0].systemSize).toBeCloseTo(4.298/energySystemB.efficiency);
    expect(result.systemSize.decentralized[0].numberOfBuildings).toEqual(3);
    Object.keys(result.maintenanceCost).forEach(key => {
      const exp = key === "substation" ? 13.575: 0;
      expect(result.maintenanceCost[key as TCostCurveType]).toBeCloseTo(exp);
    });
    Object.keys(result.investmentCost).forEach(key => {
      const exp = key === "substation" ? 13.575: 0;
      expect(result.investmentCost[key as TCostCurveType]).toBeCloseTo(exp);
    });
    Object.keys(result.embodiedEmissions).forEach(key => {
      const exp = key === "substation" ? 13.575: 0;
      expect(result.embodiedEmissions[key as TCostCurveType]).toBeCloseTo(exp);
    });
    expect(result.primaryEnergyUse).toEqual(22500/energySystemB.efficiency/energySystemB.coefficientOfPerformance);
    expect(result.lifetimeEnergyCost).toBeCloseTo(444078.95);
    expect(result.emissions).toBeCloseTo(828.95);
  });
});

describe('calculateEnergySystems, decentralized', () => {
  
});

describe('calculateEnergySystemAnnualizedSpecificInvestmentCost', () => {
  it('calculates investment cost correctly', () => {
    const buildingArea = 2000;
    const result = calculateEnergySystemAnnualizedSpecificInvestmentCost(systemInfo, energySystemA, buildingArea);
    expect(result).toEqual(0.2);
  });
});

describe('calculateEnergySystemSpecificMaintenanceCost', () => {
  it('calculates maintenance cost correctly', () => {
    const buildingArea = 2000;
    const result = calculateEnergySystemSpecificMaintenanceCost(systemInfo, buildingArea);
    expect(result).toEqual(0.2);
  });
});

describe('calculateSpecificValueFromEnergySystemScenarioInfo', () => {
  it('calculates embodied emissions correctly', () => {
    const buildingArea = 2000;
    const result = calculateSpecificValueFromEnergySystemScenarioInfo(systemInfo, buildingArea, "embodiedEmissions");
    expect(result).toEqual(5);
  });
});
