import {
  calculateBuildingMeasures,
  calculateBuildingMeasureAnnualizedSpecificRefurbishmentCost,
  calculateBuildingMeasureSpecificEmbodiedEnergy,
} from '../calculate'

import { Project, BuildingType, Scenario, ScenarioInfo, EnvelopeMeasure, WindowMeasure, HvacMeasure, IScenarioBuildingMeasureData, IScenarioFoundationMeasureData, IScenarioEnvelopeMeasureData, IScenarioWindowsMeasureData } from '../../types'

const insulationMeasureA = new EnvelopeMeasure("insulation", "insulationA");
insulationMeasureA.refurbishmentCost = 10;
insulationMeasureA.lifeTime = 25;
insulationMeasureA.embodiedEnergy = 5;

const windowMeasureA = new WindowMeasure("windows", "windowA");
windowMeasureA.refurbishmentCost = 20;
windowMeasureA.lifeTime = 25;
windowMeasureA.embodiedEnergy = 10;

const hvacMeasureA = new HvacMeasure("hvac", "hvacA");
hvacMeasureA.refurbishmentCost = 200;
hvacMeasureA.lifeTime = 25;
hvacMeasureA.embodiedEnergy = 100;

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


describe('calculateBuildingMeasures', () => {
  it('calculates building measures', () => {
    // GIVEN
    const project = new Project("project", "owner", false);

    const scenarioId = "scenarioA";
    const scenario = new Scenario(scenarioId);
    
    scenario.buildingTypes[buildingTypeId] = scenarioInfo;

    project.calcData.buildingTypes = { [buildingTypeId]: buildingType };
    project.calcData.buildingMeasures["insulation"][insulationMeasureA.id] = insulationMeasureA;
    project.calcData.buildingMeasures["windows"][windowMeasureA.id] = windowMeasureA;
    project.calcData.buildingMeasures["hvac"][hvacMeasureA.id] = hvacMeasureA;
    project.scenarioData.scenarios[scenarioId] = scenario;
    
    // WHEN
    const result = calculateBuildingMeasures(project);

    // THEN
    expect(result[scenarioId].facade[insulationMeasureA.id].refurbishmentCost).toBeCloseTo(690);
    expect(result[scenarioId].facade[insulationMeasureA.id].embodiedEnergy).toBeCloseTo(345);
    expect(result[scenarioId].roof[insulationMeasureA.id].refurbishmentCost).toBeCloseTo(420);
    expect(result[scenarioId].roof[insulationMeasureA.id].embodiedEnergy).toBeCloseTo(210);
    expect(result[scenarioId].foundation[insulationMeasureA.id].refurbishmentCost).toBeCloseTo(720);
    expect(result[scenarioId].foundation[insulationMeasureA.id].embodiedEnergy).toBeCloseTo(360);
    expect(result[scenarioId].windows[windowMeasureA.id].refurbishmentCost).toBeCloseTo(6000);
    expect(result[scenarioId].windows[windowMeasureA.id].embodiedEnergy).toBeCloseTo(3000);
    expect(result[scenarioId].hvac[hvacMeasureA.id].refurbishmentCost).toBeCloseTo(600);
    expect(result[scenarioId].hvac[hvacMeasureA.id].embodiedEnergy).toBeCloseTo(300);
  });
});

describe('calculateBuildingMeasureAnnualizedSpecificRefurbishmentCost', () => {
  it('calculates annualized specific cost correctly', () => {
    // GIVEN
    const buildingArea = 1000;
    const measureInfo = {
      refurbishmentCost: 50000,
      embodiedEnergy: 25000,
    }

    // WHEN
    const result = calculateBuildingMeasureAnnualizedSpecificRefurbishmentCost(measureInfo, insulationMeasureA, buildingArea);

    // THEN
    expect(result).toBeCloseTo(2);
  });
});

describe('calculateBuildingMeasureSpecificEmbodiedEnergy', () => {
  it('calculates specific embodied energy correctly', () => {
          // GIVEN
    const buildingArea = 1000;
    const measureInfo = {
      refurbishmentCost: 50000,
      embodiedEnergy: 25000,
    }

    // WHEN
    const result = calculateBuildingMeasureSpecificEmbodiedEnergy(measureInfo, buildingArea);

    // THEN
    expect(result).toBeCloseTo(25);
  });
});

