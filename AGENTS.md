This **Product Requirements Document (PRD)** outlines the development of a digital educational platform called **"EduGraph: School Epidemic Simulator."** The tool is based on your research into "The Invisible Social Network of a School" and aims to help students and administrators visualize social dynamics and simulate public health scenarios using Graph Theory and the SIR model.

---

# PRD: EduGraph - School Epidemic & Social Network Simulator

## 1. Project Overview
**EduGraph** is an interactive analysis tool that transforms raw survey data (who is friends with whom) into a mathematical "Social Map." It identifies the most influential students, the "bridges" between classes, and runs a real-time **SIR (Susceptible, Infected, Recovered)** simulation to show how a virus or information would spread through that specific network.

## 2. Target Audience
*   **Students:** To learn Graph Theory (nodes, edges, centrality) through their own social data.
*   **School Administration & Guidance Counselors:** To identify socially isolated students or evaluate "super-spreader" nodes for school health planning.
*   **Math Teachers:** As a practical tool for teaching statistics and modeling.

---

## 3. Functional Requirements

### 3.1. Module 1: Social Network Constructor (The "Invisible" Map)
*   **Data Import:** Support for Excel/CSV files where Column A = Student ID and Column B = Friend ID.
*   **Network Visualization:** 
    *   **Nodes:** Representing students.
    *   **Edges:** Representing friendship connections (Directed/Undirected).
*   **Community Detection:** Automate the **Louvain Algorithm** to color-code clusters (e.g., automatically identifying Class 9A vs Class 10B based on connection density).
*   **Interactive Metrics:** Hovering over a student (node) displays:
    *   **In-degree:** How many people named them a friend (Popularity).
    *   **Out-degree:** How many friends they named (Sociability).

### 3.2. Module 2: The "Bridge" & Centrality Finder
*   **Influence Filters:** Toggle views to highlight specific nodes:
    *   **Popularity View:** Sizes nodes by total Degree.
    *   **Bridge View:** Highlights nodes with high **Betweenness Centrality** (students who connect two different friend groups).
*   **Small World Metric:** Display the "Average Path Length" (as per the report's 4.3 steps) to show how "close" the school is.

### 3.3. Module 3: SIR Epidemic Simulation Engine
*   **Simulation Controls:**
    *   **Patient Zero:** User clicks any node to start the infection there.
    *   **Infection Probability ($\beta$):** Slider to set how likely the virus is to jump between friends.
    *   **Recovery Rate ($\gamma$):** Slider to set how long a student remains "Infected."
*   **Visual Spread:** A "Play" button that shows the infection turning nodes **RED** step-by-step along the edges.
*   **Dynamic Charting:** A real-time line graph showing the **S, I, and R curves** as the simulation runs.

---

## 4. Visual & UI Requirements

### 4.1. The Graph Dashboard
*   **Layout:** A force-directed graph (nodes bounce and settle into clusters).
*   **Legend:**
    *   **Blue:** Susceptible (S).
    *   **Red:** Infected (I).
    *   **Green:** Recovered/Immune (R).
*   **Sidebar:** Real-time stats (Total Infected, Peak Infection Step, Nodes remaining Susceptible).

### 4.2. "What-If" Analysis Tools
*   **Node Removal (Quarantine) Simulation:** User can "right-click" a high-centrality node to "quarantine" it (remove from graph) and then re-run the simulation to see how much slower the virus spreads.

---

## 5. Technical Specifications

*   **Logic Engine:** NetworkX (Python library) for graph calculations.
*   **Frontend:** D3.js or Sigma.js for high-performance network visualization (handling 300+ nodes and 2000+ edges smoothly).
*   **Graph Algorithms:**
    *   **Betweenness Centrality:** To identify the "Bridges."
    *   **Diameter Calculation:** To find the maximum distance between any two students.
    *   **Clustering Coefficient:** To measure how "cliquey" the school is.

---

## 6. User Experience (UX) Scenarios

### Scenario A: The Science Fair Demo
1.  A student clicks "Start Simulation" on a student who is a "Bridge" (e.g., student 9B-07 from the report).
2.  The UI shows the infection quickly jumping from the 9th-grade cluster to the 11th-grade cluster.
3.  The chart peaks quickly at 60+ infections.
4.  **Lesson:** Bridges are critical for cross-community spread.

### Scenario B: Guidance Counseling
1.  The counselor filters for nodes with a **Degree < 2**.
2.  The graph highlights students on the periphery of the network.
3.  **Lesson:** These students may be at risk of social exclusion and need support.

---

## 7. Success Metrics
*   **Accuracy:** The simulation results should match the mathematical distribution found in the report (e.g., peak infection around steps 20-25).
*   **Engagement:** Users should be able to run a full "Infection to Recovery" cycle in under 30 seconds.
*   **Insight:** Users should be able to identify the top 5 "Bridges" in the network within two clicks.

---

## 8. Development Roadmap
1.  **MVP (Minimum Viable Product):** Static graph upload and Degree calculation.
2.  **V2:** Interactive SIR Simulation with time-series graphs.
3.  **V3:** "Quarantine Mode" (Interactive node removal to test herd immunity).
4.  **V4:** Comparison mode (Simulate spread on a "Sparse" vs "Dense" network).