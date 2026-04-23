# 🌌 HoloLab: Complete Feature Set

**HoloLab** is a next-generation Augmented Reality (AR) science laboratory offering comprehensive, gesture-controlled simulations across Chemistry and Physics.

---

## 🧪 **Chemistry & Quantum Mechanics**

### 1. Quantum Atom Engine
*   **High-Fidelity Rendering**: Fully 3D atomic structures featuring discrete protons (`+`) and neutrons (`0`) housed within a glowing "Nuclear Forge" core.
*   **Realistic Electron Orbitals**: Highly accurate visualization of `s`, `p`, `d`, and `f` electron shells utilizing rejection-sampled point clouds and precise volumetric glow shapes.
*   **Dynamic Scaling**: Atoms scale uniformly (nucleus, orbitals, and labels) allowing them to fit seamlessly in both the immersive 3D workspace and the localized UI trays.

### 2. Molecular Synthesis & Reactions
*   **Proximity-Based Bonding**: Dragging atoms close to one another in 3D space triggers real-time magnetic snapping and bonding.
*   **Automated Reaction Identification**: The engine instantly recognizes compound formations (e.g., bringing `Na` and `Cl` together triggers an "IONIC SYNTHESIS: SODIUM CHLORIDE" HUD alert).
*   **Bond Manipulation**: Holographic molecular bonds visually connect synthesized atoms and can be broken apart via spatial grab-and-pull gestures.
*   **Execute Reaction**: Dedicated execution sequence to finalize and stabilize complex multi-atom reactions within the workspace.

### 3. AR Workspace Management
*   **Interactive Periodic Table**: A dynamic, categorized periodic table overlay classifying elements into noble gases, alkali metals, transition metals, and more.
*   **Instant Quantum Spawning**: Selecting elements from the periodic table drops them directly into the center of the AR workspace for immediate interaction.
*   **3D Inventory Tray**: An animated, bottom-docked tray containing active elements represented as miniature, fully-realistic 3D atoms, allowing easy drag-and-drop workflow.
*   **Workspace Deletion Zone**: Intuitive "Trash Zone" for deleting unnecessary elements from the active environment.

---

## 🔭 **Physics & Macroscopic Simulations**

### 1. Advanced Simulation Labs
*   **Force & Motion**: Explore Newton's laws through interactive velocity and momentum experiments.
*   **Gravity Lab**: Simulate different planetary gravitational constants including Earth, Moon, and Zero-G environments.
*   **Wave Simulation**: Manipulate amplitude, frequency, and visualize wave interference patterns in real-time.
*   **Magnetism**: Observe magnetic fields, polarity, attraction, and repulsion through interactive magnetic objects.
*   **Energy Lab**: Real-time transformation tracking between Potential and Kinetic energy.
*   **Optics & Light**: Interactive ray tracing, lens manipulation, and refraction studies.

### 2. Environmental Controls
*   **Thermodynamics Control**: Discrete interactive stepper to adjust the environmental Temperature in Kelvin (affecting reaction speed and particle energy).
*   **Atmospheric Control**: Interactive stepper to adjust the environmental Pressure in ATM.

---

## ✋ **Gesture Control & AR Engine**

*   **Bare-Hand Tracking**: Powered by MediaPipe Vision, utilizing a 21-point skeletal hand landmark system overlaying the user's live camera feed.
*   **"Thumb-Index Midpoint" Precision**: Employs an advanced calculation using the exact intersection of the thumb and index finger to guarantee 100% accurate, surgical interaction in 3D space.
*   **Magnetic UI Snapping**: Interface elements generate a 60px "magnetic field" that snaps the user's cursor to the center of buttons, eliminating input latency and missed selections.
*   **Spatial Grabbing & Dragging**: Users can physically pinch holographic atoms and move them freely across the X, Y, and Z (depth) axes.
*   **Two-Hand Pinch-to-Zoom**: Utilizing both hands, users can grab the virtual space and pull apart/push together to scale the entire AR environment dynamically.
*   **1-Euro Filter Smoothing**: Adaptive signal processing ensures zero latency during fast hand movements while maintaining rock-solid stability when the hand is still.

---

## 🤖 **HoloAI Assistant**

*   **Context-Aware Tutor**: Integrated Google Gemini AI that monitors the user's workspace and provides dynamic, real-time guidance.
*   **Diagnostic HUD**: Continuous tracking status indicator (Scanning, Active, Error) guiding users on optimal hand positioning and lighting conditions.
*   **Scientific Explanations**: Seamlessly translates ongoing chemical reactions and physics setups into digestible, educational text directly on the screen.
