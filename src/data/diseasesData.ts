export type DiseaseType = 
  | 'Fungal'
  | 'Bacterial'
  | 'Viral'
  | 'Pest Infestation'
  | 'Nutrient Deficiency'
  | 'Physiological'
  | 'Other';

export type SeverityLevel = 'Mild' | 'Moderate' | 'High';

export interface Disease {
  id: string;
  name: string;
  crop: string;
  type: DiseaseType;
  severity: SeverityLevel;
  shortDescription: string;
  imageUrl: string;
  scientificName: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatments: {
    organic: string[];
    chemical: string[];
  };
}

export const DISEASES_DATA: Disease[] = [
  // ROW 1
  {
    id: 'early-blight-tomato',
    name: 'Early Blight',
    crop: 'Tomato',
    type: 'Fungal',
    severity: 'High',
    shortDescription: 'Dark brown spots with concentric rings, usually on older leaves.',
    imageUrl: '/diseases_assets/early_blight_tomato.jpg',
    scientificName: 'Alternaria solani',
    symptoms: [
      'Circular dark brown to black spots with concentric rings ("bullseye" target appearance)',
      'Yellow chlorotic halos surrounding older lesions',
      'Premature defoliation starting from the lower canopy upwards',
      'Dark sunken stem cankers near soil level and fruit collar rot'
    ],
    causes: [
      'High humidity (>85%) combined with warm temperatures (24°C - 29°C)',
      'Overhead irrigation splashing fungal spores from soil onto lower foliage',
      'Dense foliage limiting airflow and prolonged leaf wetness'
    ],
    prevention: [
      'Implement a minimum 3-year crop rotation with non-solanaceous crops',
      'Prune lower foliage and stake tomato plants to prevent soil contact',
      'Apply organic mulch (straw or plastic) around the root zone',
      'Utilize drip irrigation rather than overhead sprinklers'
    ],
    treatments: {
      organic: [
        'Apply copper octanoate or Bordeaux mixture at first sign of symptoms',
        'Spray Bacillus subtilis or Trichoderma viride bio-fungicides every 7-10 days',
        'Neem seed kernel extract (5%) spray to suppress fungal spore germination'
      ],
      chemical: [
        'Chlorothalonil (0.2%) protective foliage application',
        'Mancozeb (75% WP) @ 2-2.5 g/L applied bi-weekly',
        'Azoxystrobin or Difenoconazole curative sprays for severe infestations'
      ]
    }
  },
  {
    id: 'powdery-mildew-tomato',
    name: 'Powdery Mildew',
    crop: 'Tomato',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'White powdery growth on leaves, stems and fruits.',
    imageUrl: '/diseases_assets/powdery_mildew_tomato.jpg',
    scientificName: 'Leveillula taurica / Oidium neolycopersici',
    symptoms: [
      'Talcum powder-like white fungal mycelium patches on the upper and lower leaf surfaces',
      'Chlorotic yellow blotches on upper leaf surfaces corresponding to white patches beneath',
      'Leaf curling, browning, and premature senescent drying',
      'Reduced photosynthesis and sunscald on unprotected fruit'
    ],
    causes: [
      'Moderate temperatures (20°C - 26°C) with dry atmospheric conditions and high relative humidity at night',
      'Shaded canopies and overcrowded plant spacing',
      'Excessive nitrogen fertilization promoting dense, succulent vegetative growth'
    ],
    prevention: [
      'Ensure adequate plant spacing (at least 60 cm between rows) for continuous ventilation',
      'Grow tolerant tomato varieties and avoid excessive nitrogen application',
      'Maintain balanced potassium levels to strengthen leaf cuticle integrity'
    ],
    treatments: {
      organic: [
        'Foliar spray of 0.5% baking soda (potassium or sodium bicarbonate) with horticultural soap',
        'Diluted milk spray (1:9 ratio with water) exposed to direct sunlight',
        'Sulfur-based dust or wettable sulfur applied in early morning'
      ],
      chemical: [
        'Hexaconazole 5% EC @ 1 ml/L or Myclobutanil',
        'Penconazole or Tebuconazole applications at early onset',
        'Pyraclostrobin rotating with different FRAC groups to prevent resistance'
      ]
    }
  },
  {
    id: 'tomato-mosaic-virus',
    name: 'Tomato Mosaic Virus',
    crop: 'Tomato',
    type: 'Viral',
    severity: 'High',
    shortDescription: 'Mottled yellow-green leaves and stunted plant growth.',
    imageUrl: '/diseases_assets/tomato_mosaic_virus.jpg',
    scientificName: 'Tomato mosaic tobamovirus (ToMV)',
    symptoms: [
      'Alternating light green and dark green mosaic or mottled leaf pigmentation',
      'Distorted, puckered, blistered, or "shoestring" fern-like leaf blades',
      'Severe plant stunting, delayed flowering, and reduced fruit set',
      'Internal brown necrosis within fruit walls and uneven ripening'
    ],
    causes: [
      'Extremely stable virus spread mechanically via pruning tools, hands, and worker clothing',
      'Contaminated seed coats and infected crop residues in soil',
      'Chewing insects (grasshoppers, aphids) occasionally vectoring virus particles'
    ],
    prevention: [
      'Use certified disease-free, hot-water or trisodium phosphate-treated seed lots',
      'Dip tools in a 10% household bleach or non-fat dry milk (20%) solution between plants',
      'Strictly prohibit tobacco smoking/handling near greenhouse plants (Tobacco Mosaic Virus cross-infection)',
      'Promptly rogue and incinerate infected plants upon first visual confirmation'
    ],
    treatments: {
      organic: [
        'No curative virucidal chemical exists; management relies on roguing',
        'Apply seaweed extracts and systemic acquired resistance (SAR) inducers to bolster plant immunity',
        'Spray skimmed milk solution (15%) during transplantation to inactivate mechanical virions'
      ],
      chemical: [
        'Sanitize all greenhouse structures, trellises, and stakes with virucidal disinfectants (Virkon S or 10% sodium hypochlorite)',
        'Maintain strict vector control for aphid and thrips populations'
      ]
    }
  },
  {
    id: 'bacterial-spot-tomato',
    name: 'Bacterial Spot',
    crop: 'Tomato',
    type: 'Bacterial',
    severity: 'Moderate',
    shortDescription: 'Small water-soaked spots that turn dark brown.',
    imageUrl: '/diseases_assets/bacterial_spot_tomato.jpg',
    scientificName: 'Xanthomonas vesicatoria / perforans',
    symptoms: [
      'Minute, circular, water-soaked dark spots (<3 mm) on foliage',
      'Spots turn angular, dark brown to black, often with a greasy translucent texture',
      'Shot-hole appearance as necrotic centers dry up and drop out',
      'Rough, raised, scab-like black pustules on green tomato fruit'
    ],
    causes: [
      'Warm, wet weather (24°C - 30°C) with persistent driving rain or overhead sprinkler irrigation',
      'Bacteria entering leaves through stomata and microscopic pruning or insect wounds',
      'Infected volunteer plants and weeds serving as overwintering reservoirs'
    ],
    prevention: [
      'Plant certified disease-free seed and resistant cultivars (e.g. Xv4 resistance)',
      'Avoid field operations (cultivation, tying, pruning) when plants are wet',
      'Implement furrow or drip irrigation to keep leaf surfaces dry',
      'Sterilize seed trays and nursery soil with steam or solarization'
    ],
    treatments: {
      organic: [
        'Fixed copper sprays (copper hydroxide) combined with Bacillus amyloliquefaciens',
        'Preventive compost tea drenches to enhance phyllosphere competitive microflora'
      ],
      chemical: [
        'Tank mixture of Copper Hydroxide (77% WP) + Mancozeb (2 g/L) to overcome copper tolerance',
        'Streptomycin sulfate or Kasugamycin sprays where legally permitted in high-pressure regions',
        'Acibenzolar-S-methyl (Actigard) plant defense booster'
      ]
    }
  },
  {
    id: 'late-blight-potato',
    name: 'Late Blight',
    crop: 'Potato',
    type: 'Fungal',
    severity: 'High',
    shortDescription: 'Dark, water-soaked lesions on leaves and stems.',
    imageUrl: '/diseases_assets/late_blight_potato.jpg',
    scientificName: 'Phytophthora infestans (Oomycete)',
    symptoms: [
      'Large, irregular, water-soaked pale-to-dark green lesions that rapidly turn purplish-black',
      'Delicate white powdery downy fungal growth on lesion margins under humid conditions',
      'Dark brown to black stem lesions causing entire branch collapse',
      'Granular coppery-brown dry rot penetrating into potato tuber flesh'
    ],
    causes: [
      'Cool, moist weather (15°C - 22°C) with prolonged relative humidity (>90%)',
      'Airborne sporangia carried for miles by prevailing wind and fog',
      'Infected seed tubers planted in the spring spreading inoculum'
    ],
    prevention: [
      'Plant certified disease-free seed tubers; inspect tuber eyes for copper discoloration',
      'Destroy cull piles and eliminate volunteer potato sprouts before field emergence',
      'Hilling up soil to at least 15 cm above tubers to prevent zoospore washdown',
      'Desiccate or kill haulms (vines) at least two weeks before harvest'
    ],
    treatments: {
      organic: [
        'Preventive copper oxychloride or copper sulfate sprays applied before rain events',
        'Trichoderma harzianum soil and foliar inoculants'
      ],
      chemical: [
        'Cymoxanil + Mancozeb (Curzate) early curative treatment',
        'Dimethomorph or Metalaxyl-M for systemic vascular protection',
        'Fluopicolide + Propamocarb hydrochloride (Infinito) during epidemic outbreaks'
      ]
    }
  },
  {
    id: 'potato-virus-y',
    name: 'Potato Virus Y',
    crop: 'Potato',
    type: 'Viral',
    severity: 'Moderate',
    shortDescription: 'Yellow mosaic pattern and reduced leaf size.',
    imageUrl: '/diseases_assets/potato_virus_y.jpg',
    scientificName: 'Potato virus Y (PVY)',
    symptoms: [
      'Mild to severe yellow-green mosaic mottle and rugose leaf crinkling',
      'Veinal necrosis on undersides of leaflets and dark brown stem streaking',
      'Leaf drop leaving bare stems with a tuft of leaves at the top ("palm tree" effect)',
      'Tuber necrotic ringspot lesions in susceptible varieties'
    ],
    causes: [
      'Non-persistent transmission by more than 50 aphid species (notably Myzus persicae)',
      'Infected seed tubers perpetuating virus into subsequent seasons',
      'Mechanical transmission via tractor wheels, cutters, and cultivating implements'
    ],
    prevention: [
      'Plant only high-generation, certified virus-free seed potatoes',
      'Utilize yellow sticky traps to monitor aphid migration flights',
      'Intercrop with non-host border barrier crops (sorghum or maize)',
      'Early harvest or chemical vine-killing to prevent late-season aphid inoculation'
    ],
    treatments: {
      organic: [
        'Weekly applications of mineral or paraffin oil (1-2%) to interfere with aphid virus stylet loading',
        'Rogue out symptomatic plants completely including seed pieces'
      ],
      chemical: [
        'Systemic insecticides (Imidacloprid, Thiamethoxam, Flonicamid) to suppress vector populations',
        'Pymetrozine feeding blocker to halt aphid probe transmission'
      ]
    }
  },

  // ROW 2
  {
    id: 'anthracnose-chili',
    name: 'Anthracnose',
    crop: 'Chili',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'Dark, sunken lesions on fruits, leaves and stems.',
    imageUrl: '/diseases_assets/anthracnose_chili.jpg',
    scientificName: 'Colletotrichum capsici / gloeosporioides',
    symptoms: [
      'Circular or oblong, sunken water-soaked necrotic lesions on chili fruit',
      'Concentric rings of black acervuli (fruiting bodies) within sunken lesions',
      'Salmon-pink to orange gelatinous spore masses emerging during wet weather',
      'Premature fruit drop, dieback of twigs, and dark leaf spots'
    ],
    causes: [
      'Warm and humid conditions (27°C - 30°C with RH > 80%)',
      'Rain splash dispersing fungal conidia from soil or lower infected fruit',
      'Dense planting canopy restricting sunlight and airflow'
    ],
    prevention: [
      'Treat seed with Captan or Thiram (3 g/kg seed) before sowing',
      'Maintain wide spacing (60 x 45 cm) and stake plants off damp soil',
      'Promptly gather and burn fallen diseased fruits from the field'
    ],
    treatments: {
      organic: [
        'Foliar spray with Pseudomonas fluorescens @ 5 g/L or Trichoderma viride',
        'Neem cake soil amendment (250 kg/ha) to suppress soil-borne inoculum',
        'Bordeaux mixture (1%) application at flower bud stage'
      ],
      chemical: [
        'Azoxystrobin (23% SC) @ 1 ml/L or Difenoconazole (25% EC) @ 0.5 ml/L',
        'Carbendazim + Mancozeb (Saaf) @ 2 g/L applied every 12 days',
        'Tebuconazole + Trifloxystrobin (Nativo) for immediate curative action'
      ]
    }
  },
  {
    id: 'chili-leaf-curl-virus',
    name: 'Chili Leaf Curl Virus',
    crop: 'Chili',
    type: 'Viral',
    severity: 'High',
    shortDescription: 'Upward curling leaves and stunted growth.',
    imageUrl: '/diseases_assets/chili_leaf_curl.jpg',
    scientificName: 'Chilli leaf curl begomovirus (ChiLCV)',
    symptoms: [
      'Severe upward curling, cupping, and crinkling of young leaf margins',
      'Puckering, thickened veins, and chlorotic yellowing of leaf laminae',
      'Marked shortening of internodes resulting in a dense bushy, stunted plant',
      'Complete flower drop and formation of small, deformed, leathery fruit'
    ],
    causes: [
      'Transmitted exclusively by the silverleaf whitefly (Bemisia tabaci)',
      'Hot, dry weather favoring explosive whitefly multiplication',
      'Proximity to infected alternate host crops (cotton, tomato, tobacco)'
    ],
    prevention: [
      'Erect nylon insect-proof net (40-50 mesh) over nursery beds',
      'Grow tall border barrier crops (maize, pearl millet, or sorghum) around chili plots',
      'Install yellow sticky traps @ 25-30 per hectare to capture adult whiteflies',
      'Mulch with reflective silver/black polyethylene sheets to repel whiteflies'
    ],
    treatments: {
      organic: [
        'Neem oil 10,000 ppm @ 3 ml/L or 5% NSKE weekly sprays',
        'Spray entomopathogenic fungi: Lecanicillium lecanii or Beauveria bassiana @ 5 g/L',
        'Fish oil rosin soap spray to smother juvenile whitefly nymphs'
      ],
      chemical: [
        'Diafenthiuron (50% WP) @ 1.25 g/L or Spiromesifen (22.9% SC) @ 1 ml/L',
        'Flupyradifurone or Cyantraniliprole for systemic whitefly knockdown',
        'Pyriproxyfen (10% EC) insect growth regulator to disrupt egg hatching'
      ]
    }
  },
  {
    id: 'bacterial-blight-cotton',
    name: 'Bacterial Blight',
    crop: 'Cotton',
    type: 'Bacterial',
    severity: 'Moderate',
    shortDescription: 'Angular water-soaked spots turning brown.',
    imageUrl: '/diseases_assets/bacterial_blight_cotton.jpg',
    scientificName: 'Xanthomonas citri pv. malvacearum',
    symptoms: [
      'Small, angular, water-soaked leaf lesions restricted by leaf veinlets',
      'Lesions turn dark reddish-brown to black ("angular leaf spot")',
      'Elongated black lesions girdling stems and branches ("black arm")',
      'Water-soaked circular lesions on cotton bolls causing premature lint rot'
    ],
    causes: [
      'High humidity (85-90%) with warm temperatures (28°C - 35°C)',
      'Seed-borne bacterial slime (on fuzzy seed) and infected field stubble',
      'Wind-blown driving rains spreading bacteria across the field'
    ],
    prevention: [
      'Acid delinting of cotton seed with concentrated sulfuric acid (100 ml/kg seed)',
      'Seed treatment with Streptocycline (100 ppm) before planting',
      'Plant resistant hybrids possessing immune B-genes',
      'Deep plowing in summer to bury infected stalks and trash'
    ],
    treatments: {
      organic: [
        'Foliar spray with cow urine extract + hing (asafoetida) traditional biopesticide',
        'Bacillus subtilis foliar application @ 10 g/L'
      ],
      chemical: [
        'Copper Oxychloride (50% WP) @ 2.5 g/L + Streptocycline @ 0.1 g/L spray',
        'Agrimycin-100 or Kasugamycin application at seedling stage',
        'Repeat spray 15 days later if wet, humid weather persists'
      ]
    }
  },
  {
    id: 'fusarium-wilt-cotton',
    name: 'Fusarium Wilt',
    crop: 'Cotton',
    type: 'Fungal',
    severity: 'High',
    shortDescription: 'Yellowing, wilting and vascular browning.',
    imageUrl: '/diseases_assets/fusarium_wilt_cotton.jpg',
    scientificName: 'Fusarium oxysporum f. sp. vasinfectum',
    symptoms: [
      'Interveinal chlorosis and yellowing starting on lower leaves',
      'Wilting initially on one side of the plant, progressing to complete desiccation',
      'Diagnostic dark brown to black discoloration in the xylem vascular ring upon splitting stem',
      'Severe stunting and death of seedlings and mature plants alike'
    ],
    causes: [
      'Soil-borne chlamydospores persisting in soil for up to 10 years',
      'Root knot nematodes (Meloidogyne incognita) wounding roots and exacerbating infection',
      'Acidic, sandy soils and warm soil temperatures (25°C - 32°C)'
    ],
    prevention: [
      'Cultivate wilt-tolerant or resistant cultivars (e.g. resistant G. hirsutum lines)',
      'Rotate with non-host crops like cereals (sorghum, wheat, pearl millet) for 3-4 years',
      'Manage root-knot nematodes via nematicides or bioagents',
      'Apply agricultural lime to raise soil pH above 6.5 in acidic fields'
    ],
    treatments: {
      organic: [
        'Seed treatment with Trichoderma viride @ 10 g/kg seed',
        'Soil enrichment with farmyard manure enriched with Trichoderma harzianum (5 kg/ton FYM)',
        'Pseudomonas fluorescens root-drenching at early seedling emergence'
      ],
      chemical: [
        'Seed dressing with Carbendazim (50% WP) @ 2 g/kg seed',
        'Soil drenching around base of affected plants with Carbendazim (0.1%) or Propiconazole (0.1%)',
        'Thiram + Carboxin seed coating for early vigor protection'
      ]
    }
  },
  {
    id: 'leaf-rust-wheat',
    name: 'Leaf Rust',
    crop: 'Wheat',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'Orange-red pustules on leaves.',
    imageUrl: '/diseases_assets/leaf_rust_wheat.jpg',
    scientificName: 'Puccinia triticina (Brown Rust)',
    symptoms: [
      'Small, round to oval orange-brown uredinial pustules scattered randomly across the upper leaf surface',
      'Dusty powdery orange spores wiping off onto fingers or clothing when touched',
      'Chlorotic halos developing around older ruptured pustules',
      'Premature leaf senescence, decreased grain weight, and shriveled kernels'
    ],
    causes: [
      'Mild temperatures (15°C - 25°C) with dew or free moisture on leaves for 6-8 hours',
      'Urediniospores carried by wind currents over hundreds of kilometers',
      'Susceptible monoculture varieties across large regional tracts'
    ],
    prevention: [
      'Sow multi-gene rust-resistant wheat varieties (e.g., cultivars with Lr resistance genes)',
      'Ensure timely planting during recommended sowing windows to escape late-season spore showers',
      'Eradicate alternative weed hosts (Thalictrum spp.) near wheat field margins'
    ],
    treatments: {
      organic: [
        'Foliar spray of 10% garlic clove extract or ginger rhizome extract with surfactant',
        'Biological spray of Bacillus subtilis early in the reproductive stage'
      ],
      chemical: [
        'Propiconazole (25% EC) @ 1 ml/L (Tilt) single spray at first detection',
        'Tebuconazole (25.9% m/m) @ 1-1.25 ml/L applied at flag leaf stage',
        'Mancozeb (75% WP) @ 2 kg/ha protective foliar application'
      ]
    }
  },
  {
    id: 'powdery-mildew-wheat',
    name: 'Powdery Mildew',
    crop: 'Wheat',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'White powdery spots on leaves and stems.',
    imageUrl: '/diseases_assets/powdery_mildew_wheat.jpg',
    scientificName: 'Blumeria graminis f. sp. tritici',
    symptoms: [
      'Fluffy white to pale grey powdery fungal colonies appearing on lower leaf sheaths and blades',
      'Spots enlarge, coalesce, and turn dull greyish-brown with tiny black cleistothecia dots',
      'Severe yellowing, chlorosis, and premature death of lower leaves',
      'Reduced tillering and impaired spike development'
    ],
    causes: [
      'Cool, cloudy weather (15°C - 20°C) with high relative humidity (>85%) without heavy rains',
      'Dense crop canopy and excessive seeding rates hindering air circulation',
      'High nitrogen fertilization promoting lush, succulent foliar growth'
    ],
    prevention: [
      'Plant resistant wheat varieties with Pm resistance genes',
      'Avoid excessive seeding rates; maintain optimal row spacing for ventilation',
      'Avoid late or excessive top-dress nitrogen applications'
    ],
    treatments: {
      organic: [
        'Wettable sulfur @ 3 g/L foliar spray during early vegetative stage',
        'Potassium bicarbonate (0.5%) spray to dehydrate fungal hyphae',
        'Ampelomyces quisqualis hyperparasitic biofungicide'
      ],
      chemical: [
        'Propiconazole (25% EC) @ 1 ml/L or Hexaconazole @ 1.5 ml/L',
        'Metrafenone (500 SC) specialized mildew fungicide',
        'Epoxiconazole or Pyraclostrobin during flag-leaf emergence'
      ]
    }
  },

  // ROW 3
  {
    id: 'brown-spot-rice',
    name: 'Brown Spot',
    crop: 'Rice',
    type: 'Fungal',
    severity: 'High',
    shortDescription: 'Circular brown spots on leaves and grains.',
    imageUrl: '/diseases_assets/brown_spot_rice.jpg',
    scientificName: 'Bipolaris oryzae (Cochliobolus miyabeanus)',
    symptoms: [
      'Small, circular to oval sesame-seed shaped brown spots with yellow halos',
      'Larger spots with dark brown margins and light yellow or greyish-white centres',
      'Black or brown discolored spots on glumes, panicles, and paddy grains',
      'Seedling blight, poor tillering, reduced 1000-grain weight, and chalky kernels'
    ],
    causes: [
      'Nutrient-deficient soils, particularly deficiency of potassium, silicon, or zinc',
      'Water stress or drought conditions alternating with high humidity and mist',
      'Infected seed and airborne conidia from grassy weeds'
    ],
    prevention: [
      'Balanced fertilization: ensure adequate potash (K2O) and micronutrient (Zinc) application',
      'Maintain continuous shallow flooding (2-5 cm) to avoid drought stress',
      'Hot water seed treatment (53°C - 54°C for 10-12 minutes)',
      'Burn or plow down stubble and remove collateral weed hosts (Leersia hexandra)'
    ],
    treatments: {
      organic: [
        'Seed treatment with Pseudomonas fluorescens @ 10 g/kg seed',
        'Foliar spray with neem oil 3% or panchagavya (3%)',
        'Silicon soil amendments (calcium silicate) to strengthen leaf epidermis'
      ],
      chemical: [
        'Mancozeb (75% WP) @ 2.5 g/L or Zineb @ 2 g/L protective spray',
        'Edifenphos (50% EC) @ 1 ml/L or Tricyclazole + Mancozeb',
        'Propiconazole (25% EC) @ 1 ml/L applied at boot leaf and panicle emergence'
      ]
    }
  },
  {
    id: 'rice-blast-rice',
    name: 'Rice Blast',
    crop: 'Rice',
    type: 'Fungal',
    severity: 'High',
    shortDescription: 'Spindle-shaped lesions on leaves, necks and panicles.',
    imageUrl: '/diseases_assets/rice_blast_rice.jpg',
    scientificName: 'Magnaporthe oryzae (Pyricularia oryzae)',
    symptoms: [
      'Diamond or spindle-shaped lesions with grey or whitish centres and dark reddish-brown borders',
      'Lesions coalesce rapidly, causing entire leaf blades to wither and dry up ("leaf blast")',
      'Black necrotic lesions girdling the panicle base, causing drooping and white empty heads ("neck blast")',
      'Node infection turning black and snapping easily ("nodal blast")'
    ],
    causes: [
      'High relative humidity (>90%) and frequent dew or drizzle with temperatures of 20°C - 26°C',
      'Excessive applications of chemical nitrogen fertilizers',
      'Aerobic or water-stressed soil conditions promoting plant susceptibility'
    ],
    prevention: [
      'Plant blast-resistant paddy varieties with Pi resistance alleles',
      'Split nitrogen applications into 3-4 doses rather than heavy single top-dressings',
      'Ensure uninterrupted water standing in paddies during tillering and panicle initiation',
      'Seed soaking with Carbendazim (2 g/kg seed) for 24 hours before nursery sowing'
    ],
    treatments: {
      organic: [
        'Foliar spray with Pseudomonas fluorescens @ 10 g/L at maximum tillering',
        'Neem cake application in nursery beds',
        'Bio-spray of Trichoderma harzianum @ 5 g/L'
      ],
      chemical: [
        'Tricyclazole (75% WP) @ 0.6 g/L (Beam) — industry standard preventive/curative blasticide',
        'Isoprothiolane (40% EC) @ 1.5 ml/L (Fuji-One)',
        'Kasugamycin (3% SL) @ 2.5 ml/L or Azoxystrobin + Difenoconazole'
      ]
    }
  },
  {
    id: 'maize-streak-virus',
    name: 'Maize Streak Virus',
    crop: 'Maize',
    type: 'Viral',
    severity: 'Moderate',
    shortDescription: 'Yellow streaks on leaves and stunted growth.',
    imageUrl: '/diseases_assets/maize_streak_virus.jpg',
    scientificName: 'Maize streak mastrevirus (MSV)',
    symptoms: [
      'Tiny, circular chlorotic spots on the lowest parts of young leaves',
      'Spots elongate into continuous, narrow, uniform creamy-yellow streaks along the veins',
      'Complete chlorotic banding across the entire leaf blade in severe cases',
      'Severe plant stunting, shortened internodes, failure to tassel, and barren cobs'
    ],
    causes: [
      'Transmitted in a persistent manner by leafhoppers, primarily Cicadulina mbila',
      'Late-planted maize crops emerging when leafhopper populations peak',
      'Proximity to alternate grass hosts and volunteer cereal crops'
    ],
    prevention: [
      'Plant certified MSV-resistant hybrid and open-pollinated varieties',
      'Early synchronous planting at the onset of the rainy season to evade leafhoppers',
      'Maintain a 10-meter bare-ground or non-host buffer strip around the maize field',
      'Rogue out severely stunted, symptomatic seedlings within the first 30 days'
    ],
    treatments: {
      organic: [
        'Spray neem seed oil (5 ml/L) to deter leafhopper feeding and egg-laying',
        'Spray entomopathogenic Metarhizium anisopliae to control leafhopper nymphs'
      ],
      chemical: [
        'Seed treatment with Imidacloprid (600 FS) or Clothianidin for 4-6 weeks systemic protection',
        'Foliar spray of Thiamethoxam (25% WG) @ 0.25 g/L if high leafhopper pressure is scouted'
      ]
    }
  },
  {
    id: 'soybean-rust',
    name: 'Soybean Rust',
    crop: 'Soybean',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'Reddish-brown pustules on leaves.',
    imageUrl: '/diseases_assets/soybean_rust.jpg',
    scientificName: 'Phakopsora pachyrhizi',
    symptoms: [
      'Pinpoint, chlorotic spots on the lower leaf surface, rapidly forming raised uredinial pustules',
      'Pustules turn reddish-brown to tan, erupting with masses of golden-brown powdery spores',
      'Premature defoliation starting from the lower canopy, exposing pods to direct sun',
      'Poor pod fill, reduced seed weight, and early crop maturity'
    ],
    causes: [
      'Prolonged leaf wetness (>6 hours) with temperatures between 18°C and 28°C',
      'Wind-borne spores carried over long distances during humid monsoon fronts',
      'Dense canopy trapping moisture and shading lower leaves'
    ],
    prevention: [
      'Plant rust-tolerant or early-maturing soybean cultivars',
      'Avoid excessive planting density to facilitate air and solar penetration into the canopy',
      'Scout lower leaves regularly starting at the R1 (beginning bloom) growth stage'
    ],
    treatments: {
      organic: [
        'Spray sulfur-based bio-fungicides @ 3 g/L before flowering',
        'Bacillus pumilus or Trichoderma viride foliar sprays',
        'Neem cake soil application'
      ],
      chemical: [
        'Hexaconazole (5% EC) @ 1 ml/L or Propiconazole @ 1 ml/L at first appearance',
        'Azoxystrobin + Cyproconazole (Priori Xtra) dual-action systemic protection',
        'Mancozeb (75% WP) @ 2 g/L protective spray during wet spells'
      ]
    }
  },
  {
    id: 'powdery-mildew-grapes',
    name: 'Powdery Mildew',
    crop: 'Grapes',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'White powdery coating on leaves and fruits.',
    imageUrl: '/diseases_assets/powdery_mildew_grapes.jpg',
    scientificName: 'Erysiphe necator (Uncinula necator)',
    symptoms: [
      'White to dusty-grey powdery patches on upper leaf surfaces, young shoots, and berries',
      'Infected young leaves crinkle, roll upward, and exhibit distorted margins',
      'Infected berries fail to expand properly, develop web-like russeting, and crack open',
      'Foul musty odor permeating heavily infected vineyards and rotten berry clusters'
    ],
    causes: [
      'Warm, dry canopy conditions with filtered sunlight and high humidity at night (20°C - 28°C)',
      'Dense foliage shading the inner vine cordon and bunch zone',
      'Overwintering mycelium inside dormant vine buds'
    ],
    prevention: [
      'Perform regular shoot thinning and leaf pulling around grape bunches to maximize airflow and UV light',
      'Maintain an open canopy trellis system (such as Y-trellis or bower system)',
      'Avoid excessive nitrogen fertilization that stimulates overly dense vine growth'
    ],
    treatments: {
      organic: [
        'Wettable sulfur (80% WDG) @ 2-3 g/L applied preventively starting at 5-leaf stage',
        'Potassium bicarbonate @ 3 g/L spray for contact eradication of fungal hyphae',
        'Ampelomyces quisqualis microbial hyperparasite application'
      ],
      chemical: [
        'Penconazole (10% EC) @ 0.5 ml/L or Difenoconazole @ 0.5 ml/L',
        'Kresoxim-methyl (44.3% SC) @ 0.7 ml/L (Ergon)',
        'Fluopyram + Tebuconazole (Luna Experience) @ 1 ml/L during berry sizing'
      ]
    }
  },
  {
    id: 'apple-scab',
    name: 'Apple Scab',
    crop: 'Apple',
    type: 'Fungal',
    severity: 'Moderate',
    shortDescription: 'Olive-green to brown spots on leaves and fruits.',
    imageUrl: '/diseases_assets/apple_scab.jpg',
    scientificName: 'Venturia inaequalis',
    symptoms: [
      'Velvety, dull olive-green to brown circular spots on leaf surfaces and sepals',
      'Lesions become raised, corky, and dark brown with age, causing leaf puckering and yellowing',
      'Circular, crusty, rough brown-to-black corky scabs on developing apple fruits',
      'Deep fruit cracking, distortion, and stunted growth rendering fruit unmarketable'
    ],
    causes: [
      'Cool, wet spring weather (16°C - 24°C) with extended leaf wetness (>9 hours)',
      'Ascospores overwintering on fallen dead apple leaves on the orchard floor',
      'Overhead irrigation or persistent foggy conditions during green-tip and bloom'
    ],
    prevention: [
      'Flail mow or shred fallen apple leaves in autumn to accelerate decomposition',
      'Apply 5% urea spray to orchard floor in late autumn to suppress ascospore maturation',
      'Plant scab-resistant cultivars (e.g., Liberty, Prima, Enterprise, Honeycrisp)',
      'Prune apple trees annually to maintain an open canopy that dries quickly after morning dew'
    ],
    treatments: {
      organic: [
        'Liquid lime sulfur applied during tight cluster and pink bud stages',
        'Fixed copper sprays applied at silver-tip before green-tip stage to avoid fruit russeting',
        'Serenade (Bacillus subtilis) bio-fungicide during blossoming'
      ],
      chemical: [
        'Captan (50% WP) @ 2 g/L or Mancozeb protective spray',
        'Myclobutanil or Difenoconazole with strong post-infection curative kickback',
        'Trifloxystrobin or Dodine during active spring ascospore discharge periods'
      ]
    }
  }
];

export const CROP_OPTIONS = [
  'All Crops',
  'Tomato',
  'Potato',
  'Chili',
  'Cotton',
  'Wheat',
  'Rice',
  'Maize',
  'Soybean',
  'Grapes',
  'Apple'
];
