export const strings = {
    aboutAnnex75: {
        en: "Buildings are a major source of carbon emissions and cost-effectively reducing their energy use and associated emissions is particularly challenging for the existing building stock, mainly because of the existence of many architectural and technical hurdles. The transformation of existing buildings into low-emission and low-energy buildings is particularly challenging in cities, where many buildings continue to rely too much on heat supply by fossil fuels.",
    },
    supportEMail: "support.bimenergy@strusoft.com",
    githubLink: "https://github.com/annex75/",
    pdfDocsLink: "https://github.com/annex75/app/tree/master/docs", // if updated, also update in markdown/gettingStarted.md and CalculationModelDocumentation
}

export const documentation: Record<string, string> = {
  // OverviewPanel
  overviewPanel: "Provides an overview of the assessment.",
  assessmentInfo: "Contains general information about the ongoing assessment, for documentation purposes.",
  locationInfo: "Contains information about the location of the assessment, which can be edited in the Calculation Data step.",
  // CalcDataPanel
  calcDataPanel: "On this panel, calculation data is defined for use in the definition of scenarios.",
  districtCard: "Contains information on the district such as location, pipe length required"
    + " for district heating, and availability of renewables.",
  buildingTypes: "Contains information about all the building types available in the project."
    + " In the Scenarios step, several buildings can be defined which share the same building type,"
    + " that is, which share some properties such as geometry and thermal properties. "
    + " If e.g. orientation or quality of insulation differs, a new building type should be defined.",
  energySystems: "Contains information about all the energy systems defined in the project."
    + " In the Scenarios step, an energy system needs to be selected for each scenario."
    + " In all scenarios it is assumed that the heating system is replaced, with associated costs defined in this section."
    + "\n\n### Cost curves\n\nCost curves which relate system size to investment costs, maintenance costs,"
    + " as well as embodied emissions, need to be defined for each energy system option."
    + " For decentralised energy systems, only the costs of the energy system for a single building"
    + " needs to be defined. For centralised systems, both costs related to the individual heating substation of each building"
    + " as well as costs related to the district heating need to be defined."
    + "\n\n### Energy carrier\n\nEach energy system needs  an associated energy carrier,"
    + " which can be defined using the dropdown menu. Multiple energy systems can use the same energy carrier.",
  buildingMeasures: "Contains information about energy renovation measures available in the project."
    + " In the Scenarios step, combinations of  combinations of such energy efficiency measures and renewable energy measures can be investigated."
    + " Three categories of measures are available.\n\n### Additional insulation\n\nRequires information about"
    + " thermal conductivity, investment costs, and embodied emissions per thickness of insulation. Thickness of added"
    + " insulation is entered in the Scenarios step."
    + "\n\n### Windows\n\nRequires information per square metre of window. In the scenarios it is assumed that"
    + " the entirety of fenestration, as defined in the building type, is replaced."
    + "\n\n### HVAC system\n\nRequires information per unit, one per building. In the scenarios it is assumed that HVAC"
    + " systems are replaced or newly installed for every building of one type."
    + " Only one system can be defined for each building type, i.e., combining heating, ventilation and cooling",
    // ScenariosPanel
    scenariosPanel: "On this panel, scenarios are defined from the previously defined calculation data."
      + " Any number of scenarios can be added using the (+) button. For each scenario, an energy system"
      + " and renovation measures need to be defined for every building type, as well as the number of buildings"
      + " of each type. Currently, heating need for each building type needs to be calculated using"
      + " external software.",
    buildingTypeScenario: "Includes information on number of buildings per type, heating need per building,"
      + " and additional documenting information.",
    economyScenario: "Includes definition of calculation period, as well as assumed interest rate.",
    energySystemScenario: "Defines which energy system buildings of a given type is connected to.",
    buildingMeasuresScenario: "Defines the renovation measures applied to a given building type, including insulation"
      + " thickness for each component of the envelope, as well as windows and HVAC system. It is assumed"
      + " that each component is renovated to the same extent within each building type.",
    // ModelPanel
    modelPanel: "On this panel, settings for the calculations can be changed, and the calculation can be activated"
      + " if all prerequisites are met.",
}