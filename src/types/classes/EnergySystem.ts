// external
import { v4 as uuidv4 } from 'uuid';
import { Units, CostCurveLabels, IPrintableData } from '../Data';

const defSystemSizes = [ 50, 100, 500, 1000, 5000 ];
const defCostCurve = [ 0, 0, 0, 0, 0];

export const costCurveCategories = [ "investmentCost", "maintenanceCost", "embodiedEmissions" ] as const;
export type TCostCurveCategory = typeof costCurveCategories[number];
export const costCurveTypes = [ "intake", "circulation", "generation", "substation" ] as const;
export type TCostCurveType = typeof costCurveTypes[number];
export const costCurveScales = [ "centralized", "substation" ] as const;
export type TCostCurveScale = typeof costCurveScales[number];

export type TSystemCategory = "centralized" | "decentralized" | "none";

type TCostCurveRecord = Record<TCostCurveScale,Record<TCostCurveCategory, CostCurveCentralized | CostCurveIndividual>>;

export class EnergySystem {
  constructor(id: string = uuidv4()) {
    this.id = id;
    this.costCurves = {
      substation: {
        investmentCost: new CostCurveIndividual("euro", "cost"),
        maintenanceCost: new CostCurveIndividual("euroPerYear", "cost"),
        embodiedEmissions: new CostCurveIndividual("kiloGramCO2Eq", "emissions"),
      },
      centralized: {
        investmentCost: new CostCurveCentralized("euro"),
        maintenanceCost: new CostCurveCentralized("euroPerYear"),
        embodiedEmissions: new CostCurveCentralized("kiloGramCO2Eq"),
      },
    };
  }
  id: string;
  deleted: boolean = false;
  name: string = "";
  systemType: string = "";
  systemCategory: TSystemCategory = "none";
  lifeTime: number = 0;
  energyCarrier: string = "";
  efficiency: number = 1;
  coefficientOfPerformance: number = 1;
  costCurves: TCostCurveRecord;
  [key: string]: EnergySystem[keyof EnergySystem];
}

export const printableEnergySystemData = (energySystem: EnergySystem): IPrintableData[] => {
  return [
    {
      name: energySystem.name,
      level: "h4",
    },{
      name: "System type",
      value: energySystem.systemType,
    },{
      name: "Category",
      value: energySystem.systemCategory,
    },{
      name: "Reference life time",
      value: energySystem.lifeTime,
      unit: Units.years,
    },{
      name: "Energy carrier",
      value: energySystem.energyCarrier,
    },{
      name: "Efficiency",
      value: energySystem.efficiency,
      unit: Units.nonDimensional,
    },{
      name: "Coefficient of performance",
      value: energySystem.coefficientOfPerformance,
      unit: Units.nonDimensional,
    },{
      name: "Cost curves",
      level: "h5",
    },
    ...printableCostCurvesIndividual(energySystem.costCurves),
    ...(energySystem.systemCategory === "centralized"? printableCostCurvesCentralized(energySystem.costCurves): [])
  ];
}

export class CostCurveCentralized {
  constructor(unit: keyof typeof Units, curves = { systemSize: defSystemSizes, intake: defCostCurve, generation: defCostCurve, circulation: defCostCurve }) {
    this.systemSize.value = curves.systemSize;
    this.intake.unit = unit;
    this.intake.value = curves.intake;
    this.generation.unit = unit;
    this.generation.value = curves.generation;
    this.circulation.unit = unit;
    this.circulation.value = curves.circulation;
  }
  systemSize: ICostCurve = {
    label: "systemSize",
    value: defSystemSizes,
    index: 0,
    unit: "kiloWatt",
  };
  intake: ICostCurve = {
    label: "intake",
    value: defCostCurve,
    index: 1,
    unit: "none",
  };
  generation: ICostCurve = {
    label: "generation",
    value: defCostCurve,
    index: 2,
    unit: "none",
  };
  circulation: ICostCurve = {
    label: "circulation",
    value: defCostCurve,
    index: 3,
    unit: "none",
  };
  [key: string]: CostCurveCentralized[keyof CostCurveCentralized];
}


const printableCostCurvesCentralized = (costCurves: TCostCurveRecord): IPrintableData[] => {
  return [
    {
      name: "Centralised system investment cost",
      level: "h5",
    },{
      name: "System sizes",
      value: costCurves["substation"]["investmentCost"].systemSize.value.join(", "),
      unit: Units.kiloWatt,
    },{
      name: `${CostCurveLabels.intake} investment cost`,
      value: costCurves["centralized"]["investmentCost"].intake.value.join(", "),
      unit: Units.euro,
    },{
      name: `${CostCurveLabels.generation} investment cost`,
      value: costCurves["centralized"]["investmentCost"].generation.value.join(", "),
      unit: Units.euro,
    },{
      name: `${CostCurveLabels.circulation} investment cost`,
      value: costCurves["centralized"]["investmentCost"].circulation.value.join(", "),
      unit: Units.euro,
    },{
      name: "Centralised system maintenance cost",
      level: "h5",
    },{
      name: "System sizes",
      value: costCurves["substation"]["maintenanceCost"].systemSize.value.join(", "),
      unit: Units.kiloWatt,
    },{
      name: `${CostCurveLabels.intake} maintenance cost`,
      value: costCurves["centralized"]["maintenanceCost"].intake.value.join(", "),
      unit: Units.euroPerYear,
    },{
      name: `${CostCurveLabels.generation} maintenance cost`,
      value: costCurves["centralized"]["maintenanceCost"].generation.value.join(", "),
      unit: Units.euroPerYear,
    },{
      name: `${CostCurveLabels.circulation} maintenance cost`,
      value: costCurves["centralized"]["maintenanceCost"].circulation.value.join(", "),
      unit: Units.euroPerYear,
    },{
      name: "Centralised system embodied emissions",
      level: "h5",
    },{
      name: "System sizes",
      value: costCurves["substation"]["embodiedEmissions"].systemSize.value.join(", "),
      unit: Units.kiloWatt,
    },{
      name: `${CostCurveLabels.intake} embodied emissions`,
      value: costCurves["centralized"]["embodiedEmissions"].intake.value.join(", "),
      unit: Units.kiloGramCO2Eq,
    },{
      name: `${CostCurveLabels.generation} embodied emissions`,
      value: costCurves["centralized"]["embodiedEmissions"].generation.value.join(", "),
      unit: Units.kiloGramCO2Eq,
    },{
      name: `${CostCurveLabels.circulation} embodied emissions`,
      value: costCurves["centralized"]["embodiedEmissions"].circulation.value.join(", "),
      unit: Units.kiloGramCO2Eq,
    },
  ];
}

export class CostCurveIndividual {
  constructor(unit: keyof typeof Units, label: keyof typeof CostCurveLabels, curves = { systemSize: defSystemSizes, substation: defCostCurve }) {
    this.substation.unit = unit;
    this.substation.label = label;
    this.systemSize.value = curves.systemSize;
    this.substation.value = curves.substation;
  }
  systemSize: ICostCurve = {
    label: "systemSize",
    value: defSystemSizes,
    index: 0,
    unit: "kiloWatt",
  };
  substation: ICostCurve = {
    label: "substation",
    value: defCostCurve,
    index: 1,
    unit: "none",
  };
  [key: string]: CostCurveIndividual[keyof CostCurveIndividual];
}

const printableCostCurvesIndividual = (costCurves: TCostCurveRecord): IPrintableData[] => {
  return [
    {
      name: "Individual system investment cost",
      level: "h5",
    },{
      name: "System sizes",
      value: costCurves["substation"]["investmentCost"].systemSize.value.join(", "),
      unit: Units.kiloWatt,
    },{
      name: "Investment cost",
      value: costCurves["substation"]["investmentCost"].substation.value.join(", "),
      unit: Units.euro,
    },{
      name: "Individual system maintenance cost",
      level: "h5",
    },{
      name: "System sizes",
      value: costCurves["substation"]["maintenanceCost"].systemSize.value.join(", "),
      unit: Units.kiloWatt,
    },{
      name: "Maintenance cost",
      value: costCurves["substation"]["maintenanceCost"].substation.value.join(", "),
      unit: Units.euroPerYear,
    },{
      name: "Individual system embodied emissions",
      level: "h5",
    },{
      name: "System sizes",
      value: costCurves["substation"]["embodiedEmissions"].systemSize.value.join(", "),
      unit: Units.kiloWatt,
    },{
      name: "Embodied emissions",
      value: costCurves["substation"]["embodiedEmissions"].substation.value.join(", "),
      unit: Units.kiloGramCO2Eq,
    },
  ];
}

export interface ICostCurve {
  label: keyof typeof CostCurveLabels;
  unit: keyof typeof Units;
  value: number[];
  index: number;
}

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
