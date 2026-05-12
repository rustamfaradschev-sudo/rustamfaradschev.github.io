/**
 * ============================================================
 *  PROJEKTLISTE — projects.js
 * ============================================================
 *
 *  DAS IST DIE EINZIGE DATEI, DIE DU ANFASSEN MUSST,
 *  UM EIN NEUES PROJEKT HINZUZUFÜGEN.
 *
 *  DATEI-KONVENTION PRO PROJEKT:
 *  -------------------------------------------------------
 *  assets/projects/<slug>/
 *    icon.svg        → Outline-Icon in der Projektübersicht
 *    preview.jpg/png → Vorschaubild auf der Index-Seite
 *                      (fehlt es, wird 01 verwendet)
 *    01.jpg/png      → Slide 1 (Hauptbild links + Text rechts)
 *    01_2.jpg/png    → Weiteres Bild auf Slide 1 (gestapelt)
 *    02.jpg/png      → Slide 2
 *    02_2.jpg/png    → Zweites Bild auf Slide 2 (nebeneinander)
 *    03.jpg/png      → Slide 3  …usw.
 *
 *  SLIDES-FORMAT:
 *    String   → einzelnes Bild, zentriert
 *    [a, b]   → zwei Bilder nebeneinander
 *
 *  Slide 1 ist Sonderfall: Bilder erscheinen links gestapelt,
 *  Text (Titel + Beschreibung) erscheint rechts.
 * ============================================================
 */

const projects = [

  /* ======================================================
     PROJEKT 1: Forest Souvenirs
     ====================================================== */
  {
    slug: "forest-souvenirs",
    title: "Forest Souvenirs",
    displayTitle: "Forest<br>Souvenirs",
    year: "2026",
    icon: "assets/projects/forest-souvenirs/icon.svg",
    preview: "assets/projects/forest-souvenirs/preview.png",
    description: `Forest Souvenirs reimagines our relationship with everyday objects by bridging industrial production and nature-based making. Rooted in humanity's earliest practices of sourcing and shaping materials from the immediate environment, the project responds to the detachment created by global industrialization. Instead of offering finished products, it transforms a discarded aluminum car rim into a modular system of nine durable connectors, each made from 100% recycled material. These elements serve as a simple yet precise interface, enabling users to combine them with wooden branches they collect, select, and shape themselves.

Through this process, found materials become functional objects such as chairs, lamps, coat racks, hangers, or even a walking cane. Assembly requires no adhesives or specialized tools, making the system accessible, reusable, and fully recyclable. The mono-material aluminum ensures a closed material cycle, while the organic variability of wood introduces uniqueness and adaptability. Each object becomes a reflection of its maker and its environment.

Forest Souvenirs places the user at the center of creation. The act of gathering wood becomes an intentional journey—an invitation to slow down, step outside urban routines, and reconnect with nature. Walking replaces driving, making replaces consuming. This participatory approach fosters emotional attachment, material awareness, and a deeper appreciation for resources and processes.

By merging industrial logic with the archetype of self-crafted furniture, the project establishes a hybrid design language that is both contemporary and timeless. The aluminum connector acts as a threshold between two worlds: standardized production and organic growth. In doing so, Forest Souvenirs challenges conventional systems of consumption and proposes an alternative grounded in reuse, care, and engagement.

Ultimately, the project reframes everyday objects as evolving, personal artifacts. It empowers users as co-designers and encourages a shift from passive consumption toward active participation—offering not just objects, but meaningful experiences and a renewed connection to our surroundings.`,
    slides: [
      [
        "assets/projects/forest-souvenirs/01.png",
        "assets/projects/forest-souvenirs/01_1.png",
        "assets/projects/forest-souvenirs/01_2.jpg"
      ],
      {
        layout: "imageshow",
        images: [
          "assets/projects/forest-souvenirs/02.png",
          "assets/projects/forest-souvenirs/02_1.png",
          "assets/projects/forest-souvenirs/02_3.png",
          "assets/projects/forest-souvenirs/02_4.png",
          "assets/projects/forest-souvenirs/02_5.png",
          "assets/projects/forest-souvenirs/02_6.png"
        ]
      },
      {
        layout: "imageshow",
        images: [
          "assets/projects/forest-souvenirs/03_L1.png",
          "assets/projects/forest-souvenirs/03_L2.png",
          "assets/projects/forest-souvenirs/03_L3.png",
          "assets/projects/forest-souvenirs/03_L4.png",
          "assets/projects/forest-souvenirs/03_L5.png",
          "assets/projects/forest-souvenirs/03_L6.png",
          "assets/projects/forest-souvenirs/03_L7.png",
          "assets/projects/forest-souvenirs/03_L8.png",
          "assets/projects/forest-souvenirs/03_8.png"
        ],
        captions: [
          null,
          "Melanie Gloria Wisser",
          "Hannah Adam",
          "Florian Knöbl",
          "Erik Grunder",
          "Finn Baygan",
          "Johannes Bauer",
          "Sabine & Timm Adam",
          "Arthur Hanstein"
        ]
      },
      {
        layout: "imageshow",
        images: [
          "assets/projects/forest-souvenirs/04.jpg",
          "assets/projects/forest-souvenirs/04_02.png",
          "assets/projects/forest-souvenirs/04_1.jpg",
          "assets/projects/forest-souvenirs/04_3.jpg",
          "assets/projects/forest-souvenirs/04_4.jpg",
          "assets/projects/forest-souvenirs/04_6.jpg",
          "assets/projects/forest-souvenirs/04_7.jpg"
        ]
      }
    ]
  },


  /* ======================================================
     PROJEKT 2: Strahling
     ====================================================== */
  {
    slug: "strahling",
    title: "Strahling",
    year: "2023",
    icon: "assets/projects/strahling/icon.svg",
    description: `Developed in 2023 using 3D printing, Strahling is inspired by the work of Ernst Haeckel, especially Kunstformen der Natur (eng. Art Forms in Nature). Haeckel's illustrations of radiolarians reveal microscopic worlds filled with intricate geometry, radial symmetry, and almost otherworldly precision. Their delicate yet highly efficient structures became the starting point for the lamp's design. Drawing from these ancient marine organisms, Strahling transforms patterns shaped by millions of years of evolution into a contemporary object. The design reflects the intelligence and beauty found in nature, translating microscopic biodiversity into a playful and atmospheric lighting experience.`,
    slides: [
      "assets/projects/strahling/01.png",
      "assets/projects/strahling/02.jpg",
      "assets/projects/strahling/03.png",
      "assets/projects/strahling/04.jpg",
      "assets/projects/strahling/05.jpg"
    ]
  },


  /* ======================================================
     PROJEKT 3: Cone Wall
     ====================================================== */
  {
    slug: "cone-wall-group",
    title: "Cone Wall",
    displayTitle: "Cone Wall",
    year: "2025",
    icon: "assets/projects/cone-wall-group/icon.svg",
    description: `The Cone Wall Group is a family of three everyday accessories, a vase, a candleholder, and a tray - that adapt to different spaces and routines. Each piece connects seamlessly to a wall mounted cone element while also standing independently on any surface. This flexibility allows objects to move with you: a vase holding freshly picked flowers in the morning can shift from the breakfast table to the wall, safely out of reach of pets. A tray that keeps your keys in place can be switched to a candleholder when friends arrive, casting a warm cone of light across the wall for the evening. Sand-cast from 100% recycled aluminum with a natural finish, the pieces invite touch. Their smooth surfaces, weight, and cool temperature convey quality and calm, while the satisfying sound of fitting into the wall mount creates a subtle sensory ritual. By reducing three classic accessories to their essential forms and functions, the Cone Wall Group balances sculptural presence with everyday utility. It reimagines the familiar to bring comfort, rhythm, and tactility—transforming small routines into moments of clarity and celebration.`,
    slides: [
      "assets/projects/cone-wall-group/01.png",
      "assets/projects/cone-wall-group/02.jpg",
      [
        "assets/projects/cone-wall-group/03_02.png",
        "assets/projects/cone-wall-group/03.png"
      ],
      {
        layout: "imageshow",
        images: [
          "assets/projects/cone-wall-group/04_1.jpg",
          "assets/projects/cone-wall-group/04_2.jpg",
          "assets/projects/cone-wall-group/04_3.jpg",
          "assets/projects/cone-wall-group/04_4.jpg",
          "assets/projects/cone-wall-group/04_5.jpg",
          "assets/projects/cone-wall-group/04_6.jpg"
        ]
      }
    ]
  },


  /* ======================================================
     PROJEKT 4: 12020
     ====================================================== */
  {
    slug: "12020",
    title: "12020",
    year: "2024",
    icon: "assets/projects/12020/icon.svg",
    preview: "assets/projects/12020/preview.png",
    description: `12020 is designed to be built and assembled by the user using only 3D-printed components, standard off-the-shelf screws and nuts, and simple cut-to-length 120×20 aluminum profiles. The design avoids specialized or custom-manufactured parts, making fabrication accessible with basic tools and a consumer-grade 3D printer. In selected areas, the screws also function as magnetic studs, allowing a leather cushion to snap securely into place via embedded magnets. This solution provides a clean, tool-free attachment while enabling easy removal.`,
    slides: [
      "assets/projects/12020/01.jpg",
      "assets/projects/12020/02.jpg",
      "assets/projects/12020/03.jpg",
      "assets/projects/12020/04.jpg"
    ]
  },


  /* ======================================================
     PROJEKT 5: Casted Candle Holder
     ====================================================== */
  {
    slug: "gussis",
    title: "Cast Candle Holder",
    year: "2025",
    icon: "assets/projects/gussis/icon.svg",
    description: `Shaped by hand in modeling clay, this candle holder began as an intuitive gesture, soft, spontaneous, and imperfect. The form was cast in sand and poured in aluminium, capturing every curve and trace of the making process. Its underside was carefully milled flat to create a stable stand and protect the surface beneath it. A small object balancing raw texture and precision, carrying both the memory of the hand and the permanence of metal.`,
    slides: [
      "assets/projects/gussis/01.png",
      [
        "assets/projects/gussis/02.jpg",
        "assets/projects/gussis/03.jpg"
      ]
    ]
  },


  /* ======================================================
     PROJEKT 6: Wasmo
     ====================================================== */
  {
    slug: "wasmo",
    title: "Wasmo",
    year: "2022",
    icon: "assets/projects/wasmo/icon.svg",
    preview: "assets/projects/wasmo/preview.png",
    description: `In everyday life, individuals and companies generate vast amounts of waste—most of it removed from sight and often transported across continents. Once discarded, materials vanish into complex infrastructures, leaving behind little more than trust that recycling is happening. In reality, over 90% of global waste is never recycled. Disposal becomes a black hole, severing our relationship with the materials we consume. WASMO emerges as a response to this opacity. The project translates industrial paper-manufacturing techniques into an open, accessible system for domestic-scale recycling. Inspired by CNC-milled egg molds used in industry—tools, WASMO redesigns these forms for hobby-level 3D printing. Using biodegradable PLA, the molds can be produced locally for under ten euros and reused indefinitely. With nothing more than a 3D-printed mold, a vacuum source, and a household blender, users can transform waste paper and dried organic matter—such as cardboard, coffee grounds, leaves, flowers, or food peels—into functional objects. WASMO reframes waste as material and recycling as a practice.`,
    slides: [
      "assets/projects/wasmo/01.jpg",
      "assets/projects/wasmo/02.jpg",
      "assets/projects/wasmo/03.jpg",
      "assets/projects/wasmo/04.jpg"
    ]
  }

];
