# Annex 75 Calculation Model Documentation
        
Author: Toivo Säwén

Last updated: 2022-07-13

## Energy system size and cost calculations

For each scenario $S$:

>For each building type $B$:

>> $E$ := energy system used in $B$ in scenario $S$.
              
>> $Q$ := heating need $[Wh/a]$ per building of $B$ in scenario $S$.
              
>> $HLC$ := heat loss coefficient $[W/K]$ of $B$, calculated according to Equation (1).

>>> $HLC = \sum_c{U_cA_c} + \sum_w{U_wA_w} + q_{v} + q_{\Psi}$, (1)

>>> where $U_c$ is the U-value $[W/m^2K]$ of each component $c$ (roofs, exterior walls, floor, basement wall, ), calculated according to Equation (2), and $A_c$ is the total area of that component, whereas $U_w$ and $A_w$ is the U-value $[W/m^2K]$ and total area $[m^2]$ of windows, respectively, and $q_{v}$ and $q_{\Psi}$ are the heat losses due to ventilation and thermal bridges, respectively.

>>> $U_c = 1/R_c$, (2)

>>> where $R_c$ is the thermal resistance of component $c$, calculated according to Equation (3).

>>> $R_c = 1/U_{c, original} + t_{c, insulation}/\lambda_{c, insulation}$, (3)

>>> where $U_{c, original}$ is the U-value of the original construction, and $t_{c, insulation}$ and $\lambda_{c, insulation}$ are the thickness and thermal conductivity of the additional insulation, respectively.

>>> In Equation (1), the ventilation losses $q_v$ are calculated according to Equation (4).

>>> $q_v = c_{air} * n * V$, (4)

>>> where the heat storage capacity of the air $c_{air}$ $[Wh/m^3K]$ is calculated according to Equation (5), $n$ is the air change rate $[1/h]$ of the defined HVAC system, and V is the volume of the building $[m^3]$.

>>> $c_{air} = 1220 - 0.14 * a$, (5)

>>> where $a$ is the altitude above sea level $[m]$.

>>> In Equation (1), the thermal bridge losses $q_\Psi$ are calculated according to Equation (6).

>>> $q_\Psi = \sum_{tb}{q_{tb}}$, (6)

>>> where $tb$ are all the linear thermal bridges defined in the model, outlined in Equations (6a-6e). $\Psi$ values are defined in Table 1, as collected from the BIM Energy database.

>>> *Table 1*: $\Psi$ values for linear thermal bridges.

>>> | Symbol | Component | Value  |
>>> |--------| ----------| ------ |
>>> | $\Psi_{ext, ext} $| Exterior wall - exterior wall | 0.2 |
>>> | $\Psi_{ext, int} $| Exterior wall - interior floor | 0.2 |
>>> | $\Psi_{win} $| Windows | 0.04 |
>>> | $\Psi_{ext, roof} $| Exterior wall - roof | 0.14 |
>>> | $\Psi_{ext, fnd} $| Exterior wall - foundation | 0.26 |

>>> $q_{ext, ext} = \Psi_{ext, ext} * h_{storey} * n_{storeys} * 4$, (6a)

>>> where $q_{ext, ext}$ is the thermal bridge $[W/K]$ where two exterior walls meet, $h_{storey}$ is the height of each storey $[m]$ of building type $B$, and $n_{storeys}$ is the number of storeys of building type $B$. This assumes that the building is rectangular.

>>> $q_{ext, int} = \Psi_{ext, int} * p_{storey} * (n_{storeys} - 1)$, (6b)

>>> where $q_{ext, int}$ is the thermal bridge $[W/K]$ where an exterior wall meets an interior floor, $p_{storey}$ is the perimeter of each storey $[m]$ of building type $B$, and $n_{storeys}$ is the number of storeys of building type $B$. This assumes that all storeys have the same perimeter.

>>> $q_{win} = \Psi_{win} * \sqrt{A_{w}} * 4$, (6c)

>>> where $q_{win}$ is the thermal bridge $[W/K]$ surrounding each window, and $A_{w}$ is the total area $[m^2]$ of windows of the building. This assumes all windows are square shaped.

>>> $q_{ext, roof} = \Psi_{ext, roof} * p_{storey}$, (6d)

>>> where $q_{ext, roof}$ is the thermal bridge $[W/K]$ where an exterior wall meets the roof, and $p_{storey}$ is the perimeter $[m]$ of building type $B$.

>>> $q_{ext, fnd} = \Psi_{ext, fnd} * p_{storey}$, (6e)

>>> where $q_{ext, roof}$ is the thermal bridge $[W/K]$ where an exterior wall meets the foundation,  and $p_{storey}$ is the perimeter $[m]$ of building type $B$.

>> $S_d$ := size $[kW]$ of the subsystem of $E$ dedicated to each building, calculated according to Equation (7).

>> $S_d = \Delta T * HLC / \eta_{system} * 1000$, (7)

>> where $\Delta T$ is the difference between the design outdoor temperature and the setpoint heating temperature, and $\eta_{system}$ is the efficiency $[-]$ of the subsystem.

> $S_c$ := size of the central system, calculated according to Equation (8).

> $S_c = \sum_d{S_d * n_{buildings, d}}$, (8)

> where $d$ are all the subsystems connected to the central system, and $n_{d}$ are the number of buildings with such a subsystem.

> Costs $C_{investment}$, $C_{maintenance}$, and $C_{embodied}$ are calculated through linear interpolation from the respective cost curves and system sizes.

> The primary energy use PEU $[kWh]$ of $E$ is calculated according to Equation (9).

> $PEU = f_{PE} * Q_{tot} / (\eta_{system} * COP_{system})$, (9)

> where $f_{PE}$ is the primary energy factor of the energy carrier $[-]$, $Q_{tot}$ is the total heating need for all building supplied by this energy system, and $\eta_{system}$ and $COP_{system}$ are the efficiency and coefficient of performance of the energy system $[-]$.

> Emissions, $EM$ are calculated similarly, replacing $f_{PE}$ with $f_{em}$, the emission factor of the energy carrier $[-]$.

> Costs for primary energy, $C_{PE}$ are calculated according to Equation (10).

> $C_{PE} = PEU * C_e * l$, (10)

> where $C_e$ is the projected price of energy in 2030 $[€]$, and $l$ is the projected lifetime of the energy system.

## Building measure calculations

For each scenario $S$:

>For each building type $B$:

>> $C_{M,c}$ := cost of renovation measure applied to component $c$ of building type $B$ in scenario $S$, calculated according to Equation (11a) for facades, roofs, foundations, according to Equation (11b) for windows, and according to Equation (11c) for HVAC system.

>> $C_{M,c} = A_c * t_{ins} * C_{ins} * n_{buildings}$, (11a)

>> where $A_c$ is the area $[m^2]$ of the component, $t_{ins}$ is the thickness of additional insulation $[m]$, $C_{ins}$ is the cost $[€/m3]$ of the insulation material, and $n_{buildings}$ is the number of buildings of type $B$.

>> $C_{M,w} = A_w * C_{w} * n_{buildings}$, (11b)

>> where $A_w$ is the area $[m^2]$ of replaced windows, , and $C_{w}$ is the cost $[€/m2]$ of window replacement.

>> $C_{M,HVAC} = C_{HVAC} * n_{buildings}$, (11c)

>> where $C_{HVAC}$ is the cost $[€]$ of HVAC system replacement.

>> Embodied energy $C_{M,c,embodied}$ for each component is calculated similary, replacing cost $[€]$ by embodied energy $EE_c$ $[kgCO_2eq]$.

## Summation

For each scenario $S$:

> $C_{E, annualised, specific, investment}$ := annualised specific cost of investment for energy systems in scenario $S$, calculated according to Equation (12)

> $C_{E, annualised, specific, investment} = \sum_E{C_{E, investment} * l}/A_{total, buildings} $, (12)

> where $C_{E, investment}$ is the investment costs $[€]$ for all energy systems $E$ in scenario $S$, $l_E$ is the lifetime of energy system $E$, and $A_{total, buildings}$ is the total floor area of buildings in scenario $S$.

> $C_{E, specific, maintenance}$ := specific cost of maintenance for energy systems in scenario $S$, calculated according to Equation (13)

> $C_{E, specific, maintenance} = \sum_E{C_{E, maintenance}}/A_{total, buildings} $, (13)

> where $C_{E, maintenance}$ is the maintenance costs $[€/a]$ for all energy systems $E$ in scenario $S$, and $A_{total, buildings}$ is the total floor area of buildings in scenario $S$.

> Specific energy costs, $C_{specific, energy}$, specific primary energy use, $PEU_{specific}$, specific embodied energy, $EE_{E, specific}$ and specific emissions, $C_{E, specific, embodied}$, are calculated similarly using the energy cost $C_{PE}$, primary energy use $PEU$, embodied energy, $C_{embodied}$ and emissions $EM$, respectively, of each energy system.

> $C_{annualised, specific, renovation}$ := Annualised specific costs for renovation measures are also calculated similarly, according to Equation (14)

> $C_{annualised, specific, renovation} = \sum_M{\sum_c{C_{M,c} * l_{M,c}}} / A_{total, buildings}$, (14)

> where $\sum_c{C_{M,c}}$ is the sum of costs of each component $c$ for measure $M$, $l_{M,c}$ is lifetime of the measure, and $A_{total, buildings}$ is the total floor area of buildings in scenario $S$.

> Specific embodied energy is calculated similarly.

> This allows summation of costs, embodied energy, and primary energy use, according to Equations (15a-c).

> $C_{total, annualised, specific} = C_{E, annualised, specific, investment} + C_{E, specific, maintenance} + C_{specific, energy} + C_{annualised, specific, renovation}$, (15a)

> $EE_{total, specific} = C_{E, annualised, specific, embodied} + C_{M, annualised, specific, embodied}$, (15b)

> $PEU_{total, specific} = \sum_E{PEU} / A_{total, buildings}$. (15c)