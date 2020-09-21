// external
import { v4 as uuidv4 } from 'uuid';

const defSystemSizes = [ 50, 100, 150, 200, 250 ];
const defCostCurve = [ 50, 100, 150, 200, 250];

export type TCostCurveCategory = "investmentCost" | "maintenanceCost" | "embodiedEnergy";
export type TCostCurveType = "intake" | "circulation" | "generation" | "substation";
export type TCostCurveScale = "centralized" | "substation";

export class EnergySystem {
  constructor(id: string = uuidv4()) {
    this.id = id;
    this.costCurves = {
      substation: {
        investmentCost: new CostCurveIndividual("euro"),
        maintenanceCost: new CostCurveIndividual("euro/a"),
        embodiedEnergy: new CostCurveIndividual("co2eq/a"),
      },
      centralized: {
        investmentCost: new CostCurveCentralized("euro"),
        maintenanceCost: new CostCurveCentralized("euro/a"),
        embodiedEnergy: new CostCurveCentralized("co2eq/a"),
      },
    };
    this.systemSizeCurves = {
      substation: new SystemSizeCurveDict(),
      centralized: new SystemSizeCurveDict(),
    }
  }
  id: string;
  name: string = "";
  systemType: string = "";
  systemCategory: string = "none";
  lifeTime: number = 0;
  energyCarrier: string = "";
  efficiency: number = 1;
  costCurves: Record<TCostCurveScale,Record<TCostCurveCategory,CostCurveCentralized | CostCurveIndividual>>;
  systemSizeCurves: Record<TCostCurveScale,SystemSizeCurveDict>;
  [key: string]: EnergySystem[keyof EnergySystem];
}

export class CostCurveCentralized {
  constructor(unit: string) {
    this.intake.unit = unit;
    this.generation.unit = unit;
    this.circulation.unit = unit;
  }
  systemSize: ICostCurve = {
    label: "System size [kW]",
    value: defSystemSizes,
    index: 0,
    unit: "kW",
  };
  intake: ICostCurve = {
    label: "Intake",
    value: defCostCurve,
    index: 1,
    unit: "",
  };
  generation: ICostCurve = {
    label: "Generation",
    value: defCostCurve,
    index: 2,
    unit: "",
  };
  circulation: ICostCurve = {
    label: "Circulation",
    value: defCostCurve,
    index: 3,
    unit: "",
  };
  [key: string]: CostCurveCentralized[keyof CostCurveCentralized];
}

export class CostCurveIndividual {
  constructor(unit: string) {
    this.substation.unit = unit;
  }
  systemSize: ICostCurve = {
    label: "System size [kW]",
    value: defSystemSizes,
    index: 0,
    unit: "kW",
  };
  substation: ICostCurve = {
    label: "Substation",
    value: defCostCurve,
    index: 1,
    unit: "",
  };
  [key: string]: CostCurveIndividual[keyof CostCurveIndividual];
}

export class SystemSizeCurveDict {
  heatingNeed: ISystemSizeCurve = {
    label: "Heating need [kWh]",
    value: defCostCurve,
    index: 0,
    unit: "kWh",
  };
  systemSize: ISystemSizeCurve = {
    label: "System size [kW]",
    value: defSystemSizes,
    index: 1,
    unit: "kW",
  };

  // todo: this is a bit type unsafe, 
  // cf. https://stackoverflow.com/questions/54438012/an-index-signature-parameter-type-cannot-be-a-union-type-consider-using-a-mappe
  [key: string]: SystemSizeCurveDict[keyof SystemSizeCurveDict];
}

export interface ICostCurve {
  label: string;
  unit: string;
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
  unit: string;
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
