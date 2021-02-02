import {
  calculateEnergySystems,
  calculateEnergySystemAnnualizedSpecificInvestmentCost,
  calculateEnergySystemSpecificMaintenanceCost,
  calculateSpecificValueFromEnergySystemScenarioInfo,
} from '../calculate'
import { Project, BuildingType, Scenario, ScenarioInfo, EnergySystem, EnergyCarrier, TCostCurveType } from '../../types';
import { IEnergySystemScenarioInfo } from '../components/calculateEnergySystems';

const scenarioInfo = new ScenarioInfo();
scenarioInfo.buildingType.numberOfBuildings = 3;
scenarioInfo.buildingType.heatingNeed = 75;

const energyCarrierId = "energyCarrierA"
const energyCarrierA = new EnergyCarrier(energyCarrierId);
energyCarrierA.primaryEnergyFactorRe = 25;
energyCarrierA.primaryEnergyFactorNonRe = 75;
energyCarrierA.primaryEnergyFactorTotal = 100;
energyCarrierA.emissionFactor = 7;
energyCarrierA.currentPrice = 1.1;
energyCarrierA.projectedPrice = 1.5;

const energySystemId = "energySystemA"
const energySystemA = new EnergySystem(energySystemId);
energySystemA.systemType = "";
energySystemA.systemCategory = "centralized";
energySystemA.lifeTime = 25;
energySystemA.energyCarrier = energyCarrierId;
energySystemA.efficiency = 0.8;

scenarioInfo.energySystem.energySystem = energySystemId;

const systemInfo: IEnergySystemScenarioInfo = {
  heatingNeed: 750,
  individualBuildingHeatNeed: [{ heatingNeed: 250, numBuildings: 3, }],
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
  embodiedEnergy: {
    substation: 2500,
    intake: 2500,
    circulation: 2500,
    generation: 2500,
  },
};

describe('calculateEnergySystems', () => {
  it('calculates energy systems', () => {
    // GIVEN
    const project = new Project("project", "owner", false);
    const buildingTypeId = "buildingTypeA";
    const buildingType = new BuildingType(buildingTypeId);
    const scenarioId = "scenarioA";
    const scenario = new Scenario(scenarioId);
    
    scenario.buildingTypes[buildingTypeId] = scenarioInfo;

    project.calcData.buildingTypes = { [buildingTypeId]: buildingType };
    project.calcData.energyCarriers[energyCarrierId] = energyCarrierA;
    project.calcData.energySystems[energySystemId] = energySystemA;
    
    project.scenarioData.scenarios[scenarioId] = scenario;

    // WHEN
    const result = calculateEnergySystems(project)[scenarioId][energySystemId];

    // THEN
    expect(result.systemSize.centralized).toBeCloseTo(225);
    expect(result.systemSize.decentralized.filter(e => e === 75).length).toEqual(3);
    expect(Object.keys(result.maintenanceCost).filter(e => result.maintenanceCost[e as TCostCurveType] === 225).length).toEqual(4);
    expect(Object.keys(result.investmentCost).filter(e => result.investmentCost[e as TCostCurveType] === 225).length).toEqual(4);
    expect(Object.keys(result.embodiedEnergy).filter(e => result.embodiedEnergy[e as TCostCurveType] === 225).length).toEqual(4);
    expect(result.primaryEnergyUse).toEqual(28125);
    expect(result.lifetimeEnergyCost).toEqual(1054687.5);
    expect(result.emissions).toEqual(1968.75);
  });
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
    const result = calculateEnergySystemSpecificMaintenanceCost(systemInfo, energySystemA, buildingArea);
    expect(result).toEqual(5);
  });
});

describe('calculateSpecificValueFromEnergySystemScenarioInfo', () => {
  it('calculates embodied energy correctly', () => {
    const buildingArea = 2000;
    const result = calculateSpecificValueFromEnergySystemScenarioInfo(systemInfo, buildingArea, "embodiedEnergy");
    expect(result).toEqual(5);
  });
});