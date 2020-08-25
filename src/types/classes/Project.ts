// external
import { v4 as uuidv4 } from 'uuid';
import xlsx from 'xlsx';

// internal
import { APP_VERSION } from '../../constants';
import { updateFromWorkbook } from '../../WorkbookImport';
import { IProject, OverviewData, CalcData, ScenarioData, ScenarioInfo, Scenario, toXlsx, BuildingInformation, BuildingGeometry, buildingMeasureCategories, ResultSummary, } from '../Data';
import { TCostCurveCategory, TCostCurveType } from './EnergySystem';
import { calculateEnergySystems, calculateEnergySystemAnnualizedSpecificInvestmentCost, calculateEnergySystemSpecificMaintenanceCost, calculateBuildingMeasures, calculateBuildingMeasureAnnualizedSpecificRefurbishmentCost, calculateBuildingMeasureSpecificEmbodiedEnergy, calculateSpecificValueFromEnergySystemScenarioInfo } from '../../calculation-model/calculate';

export class Project implements IProject {
  appVersion = APP_VERSION;
  calculationActive: boolean = false;
  id: string = uuidv4();
  name: string;
  owner: string;
  overviewData = new OverviewData();
  calcData = new CalcData();
  scenarioData = new ScenarioData();
  deleted = false;
  timeStamp: number = Date.now();

  static fromIProject(iProject: IProject): Project {
    let project = new this(iProject.name, iProject.owner, false);
    project = Object.assign(project, iProject);
    return project;
  }

  constructor(name: string, owner: string, newScenarios: boolean = true) {
    this.name = name;
    this.owner = owner;

    if (newScenarios) {
      // create scenarios
      const scenarioId = uuidv4();
      for (const buildingTypeId in this.calcData.buildingTypes) {
        let buildingType = this.calcData.buildingTypes[buildingTypeId];
        buildingType.scenarioInfos[scenarioId] = new ScenarioInfo();
      } 
      this.scenarioData.scenarios[scenarioId] = new Scenario(scenarioId);
    }
  }

  get jsonData(): IProject {
    return JSON.parse(JSON.stringify(this));
  }
  
  updateFromWorkBook = (workBook: xlsx.WorkBook) => {
    updateFromWorkbook(this, workBook);
    console.log(this);
  }

  updateTimeStamp = () => {
    this.timeStamp = Date.now();
    return this;
  }

  performCalculations = () => {
    if (this.calculationActive) {
      const scenarioEnergySystemInfos = calculateEnergySystems(this.jsonData);
      Object.entries(scenarioEnergySystemInfos).forEach(([key, entry]) => {
        this.scenarioData.scenarios[key].energySystems = entry;
      });


      const scenarioBuildingMeasureInfos = calculateBuildingMeasures(this.jsonData);
      Object.entries(scenarioBuildingMeasureInfos).forEach(([key, entry]) => {
        buildingMeasureCategories.forEach(cat => {
          console.log()
          this.scenarioData.scenarios[key].buildingMeasures[cat] = entry[cat];
        });
      });
    }

    return this._summarize();
  }

  _summarize = () => {
    Object.keys(this.scenarioData.scenarios).forEach(scenarioId => {
      const scenario = this.scenarioData.scenarios[scenarioId];
      scenario.total = new ResultSummary();
      
      // building types

      Object.keys(this.calcData.buildingTypes).forEach(buildingTypeId => {
        const buildingType = this.calcData.buildingTypes[buildingTypeId];
        const numBuildings = buildingType.scenarioInfos[scenarioId].buildingType.numberOfBuildings;
        const heatingNeed = buildingType.scenarioInfos[scenarioId].buildingType.heatingNeed;
        const area = buildingType.buildingGeometry.grossFloorArea;
        scenario.total.buildingArea += numBuildings*area;
        scenario.total.heatingNeed = numBuildings*heatingNeed;
      });

      const keys: TCostCurveType[] = ["intake", "generation", "circulation", "substation"];
      const costCurveCats: TCostCurveCategory[] = ["investmentCost", "maintenanceCost", "embodiedEnergy"];

      // energy systems
      const totalBuildingArea = scenario.total.buildingArea;

      Object.keys(scenario.energySystems).forEach(energySystemId => {
        const energySystemScenarioInfo = scenario.energySystems[energySystemId];
        const energySystem = this.calcData.energySystems[energySystemId];
        
        costCurveCats.forEach((category) => {
          keys.forEach((key) => {
            (scenario.total.energySystems[category] as Record<TCostCurveType, number>)[key] += (energySystemScenarioInfo[category] as Record<TCostCurveType, number>)[key];
          });
        });

        const annualizedSpecificInvestmentCost = calculateEnergySystemAnnualizedSpecificInvestmentCost(energySystemScenarioInfo, energySystem, totalBuildingArea);
        const specificMaintenanceCost = calculateEnergySystemSpecificMaintenanceCost(energySystemScenarioInfo, energySystem, totalBuildingArea);
        scenario.total.annualizedSpecificCost += 
          annualizedSpecificInvestmentCost
          + specificMaintenanceCost;
        scenario.total.specificEmbodiedEnergy += calculateSpecificValueFromEnergySystemScenarioInfo(energySystemScenarioInfo, totalBuildingArea, "embodiedEnergy");
        scenario.total.specificPrimaryEnergyUse += energySystemScenarioInfo.primaryEnergyUse/totalBuildingArea;
        scenario.total.specificEmissions += energySystemScenarioInfo.emissions/totalBuildingArea;
      });

      // renovation measures

      buildingMeasureCategories.forEach(cat => {
        Object.keys(scenario.buildingMeasures[cat]).forEach(buildingMeasureId => {
          const buildingMeasure = this.calcData.buildingMeasures[cat][buildingMeasureId];
          const buildingMeasureScenarioInfo = scenario.buildingMeasures[cat][buildingMeasureId];
          scenario.total.buildingMeasures[cat].refurbishmentCost += Number(buildingMeasureScenarioInfo.refurbishmentCost);
          scenario.total.buildingMeasures[cat].embodiedEnergy += Number(buildingMeasureScenarioInfo.embodiedEnergy);
          const annualizedSpecificRefurbishmentCost = calculateBuildingMeasureAnnualizedSpecificRefurbishmentCost(buildingMeasureScenarioInfo, buildingMeasure,totalBuildingArea)
          scenario.total.annualizedSpecificCost += annualizedSpecificRefurbishmentCost;
          scenario.total.specificEmbodiedEnergy += calculateBuildingMeasureSpecificEmbodiedEnergy(buildingMeasureScenarioInfo, totalBuildingArea);
        });
      });
      
    })
    return this;
  }


  // takes an empty workbook and fills it with this project in parsed form
  // todo: this function is a complete mess and will be hard to keep up to date if we change the data format
  generateWorkbook = (workBook: xlsx.WorkBook) => {
    if (workBook.Sheets.length) {
      throw new Error("Target workbook must be empty")
    }

    // overview data
    const objKeysOverview = [ "contactInfo", "resultOverview" ];
    const valKeysOverview = [ "toolsInfo", "aboutText" ];
    const wsDataOverview = toXlsx(this.overviewData, objKeysOverview, valKeysOverview);
    const wsOverview = xlsx.utils.json_to_sheet(wsDataOverview, { header: ["key", "value"] });
    xlsx.utils.book_append_sheet(workBook, wsOverview, "Overview data");


    // calc data
    // building types
    const buildingNames = ["key"].concat(Object.keys(this.calcData.buildingTypes)
      .filter(key => !this.calcData.buildingTypes[key].deleted)
      .map(key => {
        return this.calcData.buildingTypes[key].name;
      }));
    let wsDataBuildingTypes : any[][] = [ buildingNames ];

    const objKeysBuildingType = [ "buildingGeometry", "buildingInformation" ];
    const buildingTypeTemplate = this.calcData.buildingTypes[Object.keys(this.calcData.buildingTypes)[0]];
    objKeysBuildingType.forEach(objKey => {
      Object.keys(buildingTypeTemplate[objKey]).forEach(key => {
        wsDataBuildingTypes.push([key]);
      });
    });

    Object.keys(this.calcData.buildingTypes).forEach(buildingTypeKey => {
      const buildingType = this.calcData.buildingTypes[buildingTypeKey];
      if (buildingType.deleted) {
        return;
      }
      let i = 1;
      objKeysBuildingType.forEach(objKey => {
        Object.keys(buildingTypeTemplate[objKey]).forEach(key => {
          const a = buildingType[objKey] as BuildingInformation | BuildingGeometry;
          wsDataBuildingTypes[i].push(a[key]);
          i++;
        });
      });
    });

    const wsBuildingTypes = xlsx.utils.aoa_to_sheet(wsDataBuildingTypes);
    xlsx.utils.book_append_sheet(workBook, wsBuildingTypes, "Building types");
    

    // energy systems
    const valKeysEnergySystems = [ "energyCarrier", "lifeTime", "systemCategory", "systemType", ];

    const energySystemNames = Object.keys(this.calcData.energySystems)
      .filter(key => !this.calcData.energySystems[key].deleted)
      .map(key => {
        return this.calcData.energySystems[key].name;
      });
    let wsDataEnergySystems : any[][] = [ ["key"].concat(energySystemNames) ];
    valKeysEnergySystems.forEach(key => {
      wsDataEnergySystems.push([key]);
    })

    Object.keys(this.calcData.energySystems).forEach(energySystemKey => {
      const energySystem = this.calcData.energySystems[energySystemKey];
      if (energySystem.deleted) {
        return;
      }
      let i = 1;
      valKeysEnergySystems.forEach(key => {
        wsDataEnergySystems[i].push(energySystem[key]);
        i++;
      });
    });

    const wsEnergySystems = xlsx.utils.aoa_to_sheet(wsDataEnergySystems);
    xlsx.utils.book_append_sheet(workBook, wsEnergySystems, "Energy systems");


    // cost curves
    const costCurveCategories: TCostCurveCategory[] = [ "embodiedEnergy", "investmentCost", "maintenanceCost", ]
    const costCurveKeys = [ "systemSize", "intake", "generation", "circulation", "substation", ]
    let wsDataCostCurves : any[][] = [ ["System name", ...costCurveKeys] ];
    energySystemNames.forEach(name => {
      wsDataCostCurves.push(...[
        [name],
        ["Embodied energy"], [""], [""], [""], [""],
        ["Investment"], [""], [""], [""], [""],
        ["Maintenance"], [""], [""], [""], [""],
      ]);
    });
    const offset = 1;
    const energySystemHeaderOffset = 1;
    const rowsPerCat = 5;
    let i = 0;
    Object.keys(this.calcData.energySystems).forEach(energySystemKey => {
      const energySystem = this.calcData.energySystems[energySystemKey];
      if (energySystem.deleted) {
        return;
      }
      const costCurves = energySystem.costCurves;
      let j = 0;
      costCurveCategories.forEach(cat => {
        costCurveKeys.forEach(key => {
          let k = i*(3*rowsPerCat+energySystemHeaderOffset)+j*rowsPerCat+energySystemHeaderOffset+offset;
          costCurves[cat][key].value.forEach(val => {
            wsDataCostCurves[k].push(val);
            k++;
          });
        });
        j++;
      });
      i++;
    });

    const wsCostCurves = xlsx.utils.aoa_to_sheet(wsDataCostCurves);
    xlsx.utils.book_append_sheet(workBook, wsCostCurves, "Energy system cost curves");


    // energy carriers
    const energyCarrierKeys = [ "currentPrice", "emissionFactor", "primaryEnergyFactorNonRe", "primaryEnergyFactorRe", ]
    const energyCarrierNames = Object.keys(this.calcData.energyCarriers)
      .filter(key => !this.calcData.energyCarriers[key].deleted)
      .map(key => {
        return this.calcData.energyCarriers[key].name;
      });
    let wsDataEnergyCarriers : any[][] = [ ["key"].concat(energyCarrierNames) ];

    energyCarrierKeys.forEach(key => {
      wsDataEnergyCarriers.push([key]);
    })

    Object.keys(this.calcData.energyCarriers).forEach(energyCarrierKey => {
      const energyCarrier = this.calcData.energyCarriers[energyCarrierKey];
      if (energyCarrier.deleted) {
        return;
      }
      let i = 1;
      energyCarrierKeys.forEach(key => {
        wsDataEnergyCarriers[i].push(energyCarrier[key]);
        i++;
      });
    });

    const wsEnergyCarriers = xlsx.utils.aoa_to_sheet(wsDataEnergyCarriers);
    xlsx.utils.book_append_sheet(workBook, wsEnergyCarriers, "Energy carriers");

    
    // renovation measures
    interface IBuildingPartKeys { label: string; keys: string[]; }
    interface IDictBuildingPartKeys { [key: string]: IBuildingPartKeys }
    const buildingParts: IDictBuildingPartKeys = {
      facade: {
        label: "Facade",
        keys: [ "lifeTime", "refurbishmentCost", "uValue", ],
      },
      foundation: {
        label: "Foundation",
        keys: [ "lifeTime", "refurbishmentCost", "basementWallUValue", "foundationUValue" ],
      },
      roof: {
        label: "Roof",
        keys: [ "lifeTime", "refurbishmentCost", "uValue", ],
      },
      windows: {
        label: "Windows",
        keys: [ "lifeTime", "refurbishmentCost", "uValue", "gValue",  ],
      },
      hvac: {
        label: "HVAC",
        keys: [ 
          "lifeTime",
          "refurbishmentCost",
          "coldWaterTemp",
          "coolingType",
          "efficiency",
          "energyCarrier",
          "heatingType",
          "hotWaterTemp",
          "recoveryEfficiency",
          "ventilationRate",
          "ventilationType",
        ],
      },
    }
    Object.keys(buildingParts).forEach(partKey => {
      const partMeasureKeys = buildingParts[partKey].keys;
      const partMeasureNames = Object.keys(this.calcData.buildingMeasures[partKey])
        .filter(key => !this.calcData.buildingMeasures[partKey][key].deleted)
        .map(key => {
          return this.calcData.buildingMeasures[partKey][key].measureName;
        });
      let wsDataPartMeasures : any[][] = [ ["key"].concat(partMeasureNames) ];
      partMeasureKeys.forEach(key => {
        wsDataPartMeasures.push([key]);
      })

      Object.keys(this.calcData.buildingMeasures[partKey]).forEach(partMeasureKey => {
        const partMeasure = this.calcData.buildingMeasures[partKey][partMeasureKey];
        if (partMeasure.deleted) {
          return;
        }
        let i = 1;
        partMeasureKeys.forEach(key => {
          wsDataPartMeasures[i].push(partMeasure[key]);
          i++;
        });
      });

      const wsPartMeasures = xlsx.utils.aoa_to_sheet(wsDataPartMeasures);
      xlsx.utils.book_append_sheet(workBook, wsPartMeasures, `${buildingParts[partKey].label} renovation measures`);
    });

    return workBook;

  }

}