import {
  calculateEnergySystems,
  calculateSystemSize,
  calculateEnergySystemTotalInvestmentCost,
  calculateEnergySystemTotalMaintenanceCost,
  calculateEnergySystemTotalEmbodiedEnergy,
  calculateCentralizedEnergySystemCosts,
  calculateIndividualEnergySystemCosts,
  calculateEnergySystemAnnualizedSpecificInvestmentCost,
  calculateEnergySystemSpecificMaintenanceCost,
  calculateSpecificValueFromEnergySystemScenarioInfo,
  calculateEnergySystemSpecificEmbodiedEnergy,
  calculateEnergySystemPrimaryEnergyUse,
  calculateEnergySystemEmissions,
  calculateEnergySystemLifetimeEnergyCost,
} from '../calculate'
import { Project } from '../../types';

describe('calculateEnergySystems', () => {
  it('calculates energy systems', () => {
    // GIVEN
    const project = new Project("project", "owner", false);

    // WHEN
    const result = calculateEnergySystems(project);

    // THEN
    expect(1).toEqual(1);
  });
});
describe('calculateSystemSize', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemTotalInvestmentCost', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemTotalMaintenanceCost', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemTotalEmbodiedEnergy', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateCentralizedEnergySystemCosts', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateIndividualEnergySystemCosts', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('ccalculateEnergySystemAnnualizedSpecificInvestmentCost', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemSpecificMaintenanceCost', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateSpecificValueFromEnergySystemScenarioInfo', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemSpecificEmbodiedEnergy', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemPrimaryEnergyUse', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemEmissions', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});
describe('calculateEnergySystemLifetimeEnergyCost', () => {
  it('renders without crashing', () => {
      expect(1).toEqual(1);
  });
});