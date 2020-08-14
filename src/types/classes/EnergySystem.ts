// external
import { v4 as uuidv4 } from 'uuid';

const defSystemSizes = [ 50, 100, 150, 200, 250 ];
const defCostCurve = [ 50, 100, 150, 200, 250];

export type TCostCurveCategory = "investment" | "maintenance" | "embodiedEnergy";
export type TCostCurveType = "intake" | "substation" | "circulation" | "generation";

export class EnergySystem {
  constructor(id: string = uuidv4()) {
    this.id = id;
    this.costCurves = {
      investment: new CostCurveDict("euro"),
      maintenance: new CostCurveDict("euro/a"),
      embodiedEnergy: new CostCurveDict("co2eq/a"),
    };
  }
  id: string;
  name: string = "";
  systemType: string = "";
  systemCategory: string = "District";
  lifeTime: number = 0;
  energyCarrier: string = "";
  costCurves: Record<TCostCurveCategory,CostCurveDict>;
  systemSizeCurves: SystemSizeCurveDict = new SystemSizeCurveDict();
  [key: string]: EnergySystem[keyof EnergySystem];
}

export class CostCurveDict {
  constructor(unit: string) {
    this.intake.unit = unit;
    this.generation.unit = unit;
    this.circulation.unit = unit;
    this.substation.unit = unit;
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
  substation: ICostCurve = {
    label: "Substation",
    value: defCostCurve,
    index: 4,
    unit: "",
  };
  [key: string]: CostCurveDict[keyof CostCurveDict];
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
}

export interface ICostCurveType {
  name: TCostCurveCategory;
  label: string;
  unit: string;
}