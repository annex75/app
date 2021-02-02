// external
import { v4 as uuidv4 } from 'uuid';
import { Units } from '../Data';

const defSystemSizes = [ 50, 100, 150, 200, 250 ];
const defCostCurve = [ 50, 100, 150, 200, 250];
const defEfficiencies = [ 1, 1, 1, 1, 1 ]

export const costCurveCategories = [ "investmentCost", "maintenanceCost", "embodiedEnergy" ] as const;
export type TCostCurveCategory = typeof costCurveCategories[number];
export const costCurveTypes = [ "intake", "circulation", "generation", "substation" ] as const;
export type TCostCurveType = typeof costCurveTypes[number];
export const costCurveScales = [ "centralized", "substation" ] as const;
export type TCostCurveScale = typeof costCurveScales[number];

export type TSystemCategory = "centralized" | "decentralized" | "none";

export class EnergySystem {
  constructor(id: string = uuidv4()) {
    this.id = id;
    this.costCurves = {
      substation: {
        investmentCost: new CostCurveIndividual("euro"),
        maintenanceCost: new CostCurveIndividual("euroPerYear"),
        embodiedEnergy: new CostCurveIndividual("kiloGramCO2EqPerYear"),
      },
      centralized: {
        investmentCost: new CostCurveCentralized("euro"),
        maintenanceCost: new CostCurveCentralized("euroPerYear"),
        embodiedEnergy: new CostCurveCentralized("kiloGramCO2EqPerYear"),
      },
    };
    this.systemSizeCurves = {
      substation: new SystemSizeCurveDict(),
      centralized: new SystemSizeCurveDict(),
    }
  }
  id: string;
  deleted: boolean = false;
  name: string = "";
  systemType: string = "";
  systemCategory: TSystemCategory = "none";
  lifeTime: number = 0;
  energyCarrier: string = "";
  efficiency: number = 1;
  costCurves: Record<TCostCurveScale,Record<TCostCurveCategory,CostCurveCentralized | CostCurveIndividual>>;
  systemSizeCurves: Record<TCostCurveScale,SystemSizeCurveDict>;
  [key: string]: EnergySystem[keyof EnergySystem];
}

export class CostCurveCentralized {
  constructor(unit: keyof typeof Units) {
    this.intake.unit = unit;
    this.generation.unit = unit;
    this.circulation.unit = unit;
  }
  systemSize: ICostCurve = {
    label: "System size",
    value: defSystemSizes,
    index: 0,
    unit: "kiloWatt",
  };
  intake: ICostCurve = {
    label: "Intake",
    value: defCostCurve,
    index: 1,
    unit: "none",
  };
  generation: ICostCurve = {
    label: "Generation",
    value: defCostCurve,
    index: 2,
    unit: "none",
  };
  circulation: ICostCurve = {
    label: "Circulation",
    value: defCostCurve,
    index: 3,
    unit: "none",
  };
  [key: string]: CostCurveCentralized[keyof CostCurveCentralized];
}

export class CostCurveIndividual {
  constructor(unit: keyof typeof Units) {
    this.substation.unit = unit;
  }
  systemSize: ICostCurve = {
    label: "System size",
    value: defSystemSizes,
    index: 0,
    unit: "kiloWatt",
  };
  substation: ICostCurve = {
    label: "Substation",
    value: defCostCurve,
    index: 1,
    unit: "none",
  };
  [key: string]: CostCurveIndividual[keyof CostCurveIndividual];
}

export class SystemSizeCurveDict {
  heatingNeed: ISystemSizeCurve = {
    label: "Heating need",
    value: defCostCurve,
    index: 0,
    unit: "kiloWattHour",
  };
  systemSize: ISystemSizeCurve = {
    label: "System size",
    value: defSystemSizes,
    index: 1,
    unit: "kiloWatt",
  };
  efficiency: ISystemSizeCurve = {
    label: "System efficiency",
    value: defEfficiencies,
    index: 2,
    unit: "nonDimensional",
  };

  // todo: this is a bit type unsafe, 
  // cf. https://stackoverflow.com/questions/54438012/an-index-signature-parameter-type-cannot-be-a-union-type-consider-using-a-mappe
  [key: string]: SystemSizeCurveDict[keyof SystemSizeCurveDict];
}

export interface ICostCurve {
  label: string;
  unit: keyof typeof Units;
  value: number[];
  index: number;
}

export interface ISystemSizeCurve extends ICostCurve {}

export class EnergySystemType {
  name: string = "";
  id: string = "";
}

export interface ICostCurveCategory {
  name: TCostCurveCategory;
  label: string;
  unit: keyof typeof Units;
}

export interface ICostCurveScale {
  name: TCostCurveScale;
  label: string;
}

export const energySystemTypes: EnergySystemType[] = [
  {
    name: "Lake water source HP",
    id: "lwshp",
  },{
    name: "Ground source heat pump",
    id: "gshp",
  },{
    name: "Biomass burner",
    id: "biomass",
  },{
    name: "Air source heat pump",
    id: "ashp",
  },{
    name: "Fossil fuel based",
    id: "fossil",
  },{
    name: "Other",
    id: "other",
  }
];

export const getEnergySystemType = (id: string) => {
  return energySystemTypes.find(e => e.id === id) || { name: "" };
}

export class EnergySystemCategory {
  name: string = "";
  id: string = "";
}

export const energySystemCategories: EnergySystemCategory[] = [
  {
    name: "Decentralised",
    id: "decentralized",
  },{
    name: "Centralised",
    id: "centralized",
  }
];

export const getEnergySystemCategory = (id: string) => {
  return energySystemCategories.find(e => e.id === id) || { name: "" };
}
