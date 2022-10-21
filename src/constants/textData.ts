export const strings = {
    aboutAnnex75: {
        en: "Buildings are a major source of carbon emissions and cost-effectively reducing their energy use and associated emissions is particularly challenging for the existing building stock, mainly because of the existence of many architectural and technical hurdles. The transformation of existing buildings into low-emission and low-energy buildings is particularly challenging in cities, where many buildings continue to rely too much on heat supply by fossil fuels.",
    },
    supportEMail: "support.bimenergy@strusoft.com",
    githubLink: "https://github.com/annex75/",
}

export const documentation: Record<string, string> = {
  // OverviewPanel
  overviewPanel: "Provides an overview of the assessment.",
  assessmentInfo: "Contains an overview of information about the ongoing assessment, for documentation purposes.",
  locationInfo: "Contains information about the location of the assessment, which can be edited in the Calculation Data step.",
  // CalcDataPanel
  calcDataPanel: "On this panel, calculation data is defined for use in the definition of scenarios.",
  districtCard: "Contains information on the district such as location, pipe length required"
    + " for district heating, and availability of renewables.",
  buildingTypes: "Contains information about all the building types available in the project."
    + " In the Scenarios step, several buildings can be created which share a building type,"
    + " that is, which share some properties such as geometry and thermal properties. "
    + " If e.g. orientation or quality of insulation differs, a new building type should be defined.",
  energySystems: "Contains information about all the energy systems defined in the project."
    + " In the Scenarios step, an energy system needs to be selected for each scenario."
    + "\n\n### Cost curves\n\nCost curves which relate system size to investment, maintenance,"
    + " and environmental cost need to be defined for each energy system option."
    + " For decentralised energy systems, only the costs for each individual substation"
    + " needs to be defined. For centralised systems, both costs tied to the substation"
    + " and to the central supply system need to be defined."
    + "\n\n### Energy carrier\n\nEach energy system needs  an associated energy carrier,"
    + " which can be defined using the dropdown menu. Multiple energy systems can use the same energy carrier.",
  buildingMeasures: "Contains information about energy renovation measures available in the project."
    + " In the Scenarios step, combinations of renovation measures and energy systems can be investigated."
    + " Three categories of measures are available.\n\n### Additional insulation\n\nRequires information about"
    + " thermal conductivity, and cost and environmental footprint per thickness of insulation."
    + "\n\n### Windows\n\nRequires information per square metre of window. In the scenarios it is assumed that"
    + " the entirety of fenestration, as defined in the building type, is replaced."
    + "\n\n### HVAC system\n\nRequires information per unit, one per building. In the scenarios it is assumed that HVAC"
    + " systems are replaced for every building of one type.",
    // ScenariosPanel
    scenariosPanel: "On this panel, scenarios are defined from the previously defined calculation data."
      + " Any number of scenarios can be added using the (+) button. For each scenario, an energy system"
      + " and renovation measures need to be defined for every building type, as well as number of buildings"
      + " of each type. Currently, heating need for each building type needs to be calculated using"
      + " external software.",
    buildingTypeScenario: "Includes information on number of buildings of type, heating need per building,"
      + " and additional documenting information.",
    economyScenario: "Includes definition of calculation period, as well as assumed interest rate.",
    energySystemScenario: "Defines which energy system buildings of this type is connected to.",
    buildingMeasuresScenario: "Defines the renovation measures applied to this building type, including insulation"
      + " thickness for each component of the envelope, as well as windows and HVAC system. It is assumed"
      + " that each component is renovated to the same extent within each building type.",
    // ModelPanel
    modelPanel: "On this panel, settings for the calculations can be changed, and the calculation can be activated"
      + " if all prerequisites are met.",
}