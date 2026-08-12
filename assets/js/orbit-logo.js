import {
  keplerOrbitPosition,
  TAU
} from "./orbit-math.js";


const SVG_NS =
  "http://www.w3.org/2000/svg";


let instanceCounter = 0;



/* ============================================================
   DEFAULT LOGO CONFIGURATION
   Single central place to edit all characteristics of the logo.
   ============================================================ */

export const DEFAULT_CONFIG = {
  /* --- LOGO VARIANT & SYMMETRY --- */
  variant: "stardust",       // "stardust" | "glow"
  symmetry: "asymmetric",    // "asymmetric" | "symmetric"
  seed: 202,                 // Seed for particle pseudorandom generator

  /* --- ORBIT DYNAMICS & PHYSICS --- */
  duration: 15,              // Orbit completion duration in seconds (min: 0.5)
  eccentricity: 0.25,        // Orbit eccentricity (0 = circular, max: 0.45)
  orientation: 90,          // Orbit rotation in degrees (-180 to 180)
  direction: "left",         // Direction: "left" (counter-clockwise) | "right" (clockwise)
  progress: 0.09,            // Satellite initial orbit position (0.0 to 1.0)

  /* --- SATELLITE / MOON --- */
  moonRadius: 3.05,          // Moon particle radius (min: 0.5)
  clearance: 5,            // Clearance distance around core elements (min: 0)

  /* --- DUST & FLOATING PARTICLES --- */
  dustMotionEnabled: true,   // Enable subtle floating/twinkling movement
  dustIntensity: 6,          // Particle movement amplitude scale (0 to 10)
  dustDensity: 1.2,          // Global particle count multiplier (0.25 to 4.0)

  /* --- CENTRAL BODY RADIUS --- */
  stardustCentralBodyRadius: 31.2,
  glowCentralBodyRadius: 31.5,

  /* --- STARDUST PARTICLES PARAMETERS --- */
  stardustSymmetricCount: 190,
  stardustAsymmetricCount: 235,
  stardustBaseRadius: 34,
  stardustRadialSpreadSymmetric: 2.15,
  stardustRadialSpreadAsymmetric: 2.5,
  stardustMinSize: 0.16,
  stardustMaxSize: 0.56,
  stardustMinOpacity: 0.16,
  stardustMaxOpacity: 0.9,

  /* --- GLOW PARTICLES PARAMETERS --- */
  glowNearSpeckCount: 125,
  glowFarSpeckCount: 70,
  glowSymmetricCount: 90,
  glowAsymmetricCount: 120,

  /* --- SVG CANVAS LAYOUT --- */
  viewBox: "-75 -75 250 250",
  preserveAspectRatio: "xMidYMid meet"
};



/* ============================================================
   PARTICLE DEPTH / PARALLAX LAYERS

   FAR:
     smallest movement

   MID:
     moderate movement

   NEAR:
     largest movement

   Dust intensity multiplies these distances.
   ============================================================ */

const PARTICLE_LAYER_PRESETS = [

  {
    radialAmplitude:
      0.18,

    tangentialAmplitude:
      0.28,

    speed:
      0.13,

    opacityMultiplier:
      0.72
  },


  {
    radialAmplitude:
      0.42,

    tangentialAmplitude:
      0.62,

    speed:
      0.21,

    opacityMultiplier:
      0.92
  },


  {
    radialAmplitude:
      0.82,

    tangentialAmplitude:
      1.15,

    speed:
      0.3,

    opacityMultiplier:
      1.08
  }

];



/* ============================================================
   SVG HELPER
   ============================================================ */

function createSvgElement(
  name,
  attributes = {}
) {

  const element =

    document.createElementNS(
      SVG_NS,
      name
    );


  for (
    const [
      key,
      value
    ]
    of
    Object.entries(
      attributes
    )
  ) {

    element.setAttribute(
      key,
      String(value)
    );

  }


  return element;

}



/* ============================================================
   SEEDED RANDOM GENERATOR
   ============================================================ */

function mulberry32(
  seed
) {

  let value =
    seed >>> 0;


  return function random() {

    value +=
      0x6d2b79f5;


    let result =
      value;


    result =

      Math.imul(

        result ^
        (
          result >>>
          15
        ),

        result |
        1

      );


    result ^=

      result +

      Math.imul(

        result ^
        (
          result >>>
          7
        ),

        result |
        61

      );


    return (

      (
        result ^
        (
          result >>>
          14
        )
      ) >>>

      0

    ) /

      4294967296;

  };

}



/* ============================================================
   GAUSSIAN RANDOM DISTRIBUTION
   ============================================================ */

function gaussianRandom(
  random
) {

  let u =
    0;

  let v =
    0;


  while (
    u === 0
  ) {
    u =
      random();
  }


  while (
    v === 0
  ) {
    v =
      random();
  }


  return (

    Math.sqrt(

      -2 *

      Math.log(
        u
      )

    ) *

    Math.cos(

      TAU *
      v

    )

  );

}



/* ============================================================
   ANGLE HELPERS
   ============================================================ */

function wrapAngle(
  angle
) {

  return (

    (
      angle %
      TAU
    ) +

    TAU

  ) %

    TAU;

}


function degrees(
  value
) {

  return (

    value *

    Math.PI /

    180

  );

}



/* ============================================================
   RANDOMLY ASSIGN PARTICLE DEPTH
   ============================================================ */

function chooseParticleLayer(
  random
) {

  const roll =
    random();


  if (
    roll <
    0.45
  ) {
    return 0;
  }


  if (
    roll <
    0.82
  ) {
    return 1;
  }


  return 2;

}



/* ============================================================
   GLOW DUST MOVES SLIGHTLY LESS
   ============================================================ */

function getVariantMotionScale(
  variant
) {

  return (

    variant ===
      "glow"

      ? 0.72

      : 1

  );

}



/* ============================================================
   PARTICLE MOTION PROPERTIES
   ============================================================ */

function createParticleMotion({

  random,

  variant,

  layerIndex,

  phaseOffset = 0,

  amplitudeScale = 1

}) {

  const preset =

    PARTICLE_LAYER_PRESETS[
    layerIndex
    ];


  const motionScale =

    getVariantMotionScale(
      variant
    ) *

    amplitudeScale;


  return {

    layerIndex,


    radialAmplitude:

      preset.radialAmplitude *

      motionScale *

      (
        0.88 +

        random() *

        0.28
      ),


    tangentialAmplitude:

      preset.tangentialAmplitude *

      motionScale *

      (
        0.88 +

        random() *

        0.28
      ),


    speed:

      preset.speed *

      (
        0.92 +

        random() *

        0.24
      ),


    opacityMultiplier:

      preset.opacityMultiplier,


    phase:

      random() *

      TAU +

      phaseOffset,


    twinklePhase:

      random() *

      TAU,


    twinkleSpeed:

      0.45 +

      random() *

      0.5

  };

}



/* ============================================================
   CREATE ONE PARTICLE
   ============================================================ */

function createParticleRecord({

  group,

  particleStore,

  angle,

  radius,

  size,

  opacity,

  color = null,

  motion

}) {

  const x =

    50 +

    Math.cos(
      angle
    ) *

    radius;


  const y =

    50 +

    Math.sin(
      angle
    ) *

    radius;


  const particle =

    createSvgElement(

      "circle",

      {

        cx:
          x,

        cy:
          y,

        r:
          size

      }

    );


  if (
    color
  ) {

    particle.setAttribute(
      "fill",
      color
    );

  }


  particle.setAttribute(
    "opacity",
    String(opacity)
  );


  group.appendChild(
    particle
  );


  particleStore.push({

    element:
      particle,


    baseAngle:
      angle,


    baseRadius:
      radius,


    baseSize:
      size,


    baseOpacity:
      opacity,


    baseX:
      x,


    baseY:
      y,


    ...motion

  });

}



/* ============================================================
   SYMMETRICAL PARTICLE FIELD
   ============================================================ */

function createSymmetricParticles({

  group,

  particleStore,

  count,

  random,

  variant,

  baseRadius,

  radialSpread,

  minSize,

  maxSize,

  minOpacity,

  maxOpacity

}) {

  const pairCount =

    Math.floor(
      count /
      2
    );


  for (

    let index =
      0;

    index <
    pairCount;

    index +=
    1

  ) {

    const baseAngle =

      (
        index /
        pairCount
      ) *

      Math.PI;


    const angularJitter =

      gaussianRandom(
        random
      ) *

      0.035;


    const angle =

      baseAngle +

      angularJitter;


    const radius =

      baseRadius +

      gaussianRandom(
        random
      ) *

      radialSpread;


    const size =

      minSize +

      random() *

      (
        maxSize -
        minSize
      );


    const opacity =

      minOpacity +

      random() *

      (
        maxOpacity -
        minOpacity
      );


    const layerIndex =

      chooseParticleLayer(
        random
      );


    const motion =

      createParticleMotion({

        random,

        variant,

        layerIndex

      });


    createParticleRecord({

      group,

      particleStore,

      angle,

      radius,

      size,

      opacity,

      motion

    });


    createParticleRecord({

      group,

      particleStore,


      angle:
        angle +
        Math.PI,


      radius,

      size,

      opacity,


      motion: {

        ...motion,


        phase:

          motion.phase +

          Math.PI,


        twinklePhase:

          motion.twinklePhase +

          Math.PI *
          0.37

      }

    });

  }

}



/* ============================================================
   ASYMMETRICAL PARTICLE FIELD
   ============================================================ */

function createAsymmetricParticles({

  group,

  particleStore,

  count,

  random,

  variant,

  baseRadius,

  radialSpread,

  minSize,

  maxSize,

  minOpacity,

  maxOpacity

}) {

  for (

    let index =
      0;

    index <
    count;

    index +=
    1

  ) {

    const region =
      random();


    let angle;


    if (
      region <
      0.54
    ) {

      angle =

        degrees(
          205
        ) +

        gaussianRandom(
          random
        ) *

        0.62;

    }


    else if (
      region <
      0.8
    ) {

      angle =

        degrees(
          322
        ) +

        gaussianRandom(
          random
        ) *

        0.34;

    }


    else {

      angle =

        random() *

        TAU;

    }


    angle =

      wrapAngle(
        angle
      );


    const radius =

      baseRadius +

      gaussianRandom(
        random
      ) *

      radialSpread;


    const size =

      minSize +

      random() *

      (
        maxSize -
        minSize
      );


    const opacity =

      minOpacity +

      random() *

      (
        maxOpacity -
        minOpacity
      );


    const layerIndex =

      chooseParticleLayer(
        random
      );


    const motion =

      createParticleMotion({

        random,

        variant,

        layerIndex

      });


    createParticleRecord({

      group,

      particleStore,

      angle,

      radius,

      size,

      opacity,

      motion

    });

  }

}



/* ============================================================
   GLOW-SPECIFIC PARTICLE FIELD
   ============================================================ */

function createGlowSpeckField({

  group,

  particleStore,

  random,

  count,

  baseRadius,

  radialSpread,

  minSize,

  maxSize,

  minOpacity,

  maxOpacity,

  color,

  amplitudeScale = 0.65

}) {

  for (

    let index =
      0;

    index <
    count;

    index +=
    1

  ) {

    const region =
      random();


    let angle;


    if (
      region <
      0.36
    ) {

      angle =

        degrees(
          230
        ) +

        gaussianRandom(
          random
        ) *

        0.46;

    }


    else if (
      region <
      0.7
    ) {

      angle =

        degrees(
          315
        ) +

        gaussianRandom(
          random
        ) *

        0.42;

    }


    else {

      angle =

        random() *

        TAU;

    }


    angle =
      wrapAngle(
        angle
      );


    const radius =

      baseRadius +

      gaussianRandom(
        random
      ) *

      radialSpread;


    const size =

      minSize +

      random() *

      (
        maxSize -
        minSize
      );


    const opacity =

      minOpacity +

      random() *

      (
        maxOpacity -
        minOpacity
      );


    const layerIndex =

      chooseParticleLayer(
        random
      );


    const motion =

      createParticleMotion({

        random,

        variant:
          "glow",

        layerIndex,

        amplitudeScale

      });


    createParticleRecord({

      group,

      particleStore,

      angle,

      radius,

      size,

      opacity,

      color,

      motion

    });

  }

}



/* ============================================================
   ORBIT LOGO
   ============================================================ */

export class OrbitLogo {

  static DEFAULTS = DEFAULT_CONFIG;


  constructor(
    element,
    options = {}
  ) {

    this.element =
      element;


    this.id =
      ++instanceCounter;


    /* ========================================================
       RESOLVE CONFIGURATION
       DEFAULT_CONFIG <- options <- element.dataset
       ======================================================== */

    this.config = {
      ...DEFAULT_CONFIG,
      ...options
    };


    if (element.dataset.variant) {
      this.config.variant = element.dataset.variant;
    }

    if (element.dataset.symmetry) {
      this.config.symmetry = element.dataset.symmetry;
    }

    if (element.dataset.duration !== undefined) {
      this.config.duration = Number(element.dataset.duration);
    }

    if (element.dataset.eccentricity !== undefined) {
      this.config.eccentricity = Number(element.dataset.eccentricity);
    }

    if (element.dataset.orientation !== undefined) {
      this.config.orientation = Number(element.dataset.orientation);
    }

    if (element.dataset.seed !== undefined) {
      this.config.seed = Number(element.dataset.seed);
    }

    if (element.dataset.progress !== undefined) {
      this.config.progress = Number(element.dataset.progress);
    }

    if (element.dataset.moonRadius !== undefined) {
      this.config.moonRadius = Number(element.dataset.moonRadius);
    }

    if (element.dataset.clearance !== undefined) {
      this.config.clearance = Number(element.dataset.clearance);
    }

    if (element.dataset.direction) {
      this.config.direction = element.dataset.direction;
    }

    if (element.dataset.dustMotion !== undefined) {
      this.config.dustMotionEnabled = element.dataset.dustMotion !== "false";
    }

    if (element.dataset.dustIntensity !== undefined) {
      this.config.dustIntensity = Number(element.dataset.dustIntensity);
    }

    if (element.dataset.dustDensity !== undefined) {
      this.config.dustDensity = Number(element.dataset.dustDensity);
    }


    this.applyConfig();


    /* ========================================================
       INTERNAL STATE
       ======================================================== */

    this.paused =
      false;


    this.elapsedSeconds =
      0;


    this.lastFrameTime =
      performance.now();


    this.particles =
      [];



    /* ========================================================
       REDUCED MOTION
       ======================================================== */

    this.reducedMotion =

      window.matchMedia(

        "(prefers-reduced-motion: reduce)"

      ).matches;


    if (
      this.reducedMotion
    ) {

      this.dustMotionEnabled =
        false;

    }



    /* ========================================================
       SVG
       ======================================================== */

    this.svg =

      createSvgElement(

        "svg",

        {

          viewBox:
            this.config.viewBox,


          preserveAspectRatio:
            this.config.preserveAspectRatio,


          "aria-hidden":
            "true",


          focusable:
            "false"

        }

      );


    this.svg.classList.add(

      "orbit-svg",

      `orbit-svg--${this.variant}`,

      `orbit-svg--${this.symmetry}`

    );


    this.element.replaceChildren(
      this.svg
    );


    this.build();



    if (
      !this.reducedMotion
    ) {

      this.animationFrame =

        requestAnimationFrame(
          this.animate
        );

    }

  }



  /* ==========================================================
     APPLY & UPDATE CONFIGURATION
     ========================================================== */

  applyConfig() {

    this.variant =
      this.config.variant;


    this.symmetry =
      this.config.symmetry;


    this.duration =

      Math.max(
        0.5,
        Number(this.config.duration)
      );


    this.eccentricity =

      Math.min(

        0.45,

        Math.max(
          0,
          Number(this.config.eccentricity)
        )

      );


    this.orientation =

      Number(this.config.orientation) *

      Math.PI /

      180;


    this.seed =

      Number(this.config.seed);


    this.progress =

      Number(this.config.progress);


    this.moonRadius =

      Math.max(
        0.5,
        Number(this.config.moonRadius)
      );


    this.clearance =

      Math.max(
        0,
        Number(this.config.clearance)
      );


    this.direction =
      this.config.direction;


    this.directionMultiplier =

      this.direction === "left"
        ? -1
        : 1;


    this.dustMotionEnabled =

      Boolean(this.config.dustMotionEnabled);


    this.dustIntensity =

      Math.min(

        10,

        Math.max(
          0,
          Number(this.config.dustIntensity)
        )

      );


    this.dustDensity =

      Math.min(

        4,

        Math.max(
          0.25,
          Number(this.config.dustDensity)
        )

      );

  }


  updateConfig(
    newOptions = {}
  ) {

    Object.assign(
      this.config,
      newOptions
    );


    this.applyConfig();


    this.build();

  }



  /* ==========================================================
     DENSITY MULTIPLIER
     ========================================================== */

  getScaledParticleCount(
    baseCount
  ) {

    return (

      Math.max(

        1,

        Math.round(

          baseCount *

          this.dustDensity

        )

      )

    );

  }



  /* ==========================================================
     REBUILD LOGO
     ========================================================== */

  build() {

    this.particles =
      [];


    this.svg.replaceChildren();


    if (
      this.variant ===
      "glow"
    ) {

      this.buildGlow();

    }


    else {

      this.buildStardust();

    }


    this.buildSatellite();


    this.updateSatellite();


    if (

      this.dustMotionEnabled &&

      this.dustIntensity >
      0

    ) {

      this.updateParticles();

    }


    else {

      this.resetParticles();

    }

  }



  /* ==========================================================
     STARDUST
     ========================================================== */

  buildStardust() {

    const random =

      mulberry32(
        this.seed
      );


    this.centralBodyRadius =
      this.config.stardustCentralBodyRadius;


    const subtleRing =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius

        }

      );


    subtleRing.classList.add(
      "orbit-stardust-core"
    );


    this.svg.appendChild(
      subtleRing
    );


    const particles =

      createSvgElement(
        "g"
      );


    particles.classList.add(
      "orbit-particles"
    );


    if (
      this.symmetry ===
      "symmetric"
    ) {

      createSymmetricParticles({

        group:
          particles,

        particleStore:
          this.particles,

        count:

          this.getScaledParticleCount(
            this.config.stardustSymmetricCount
          ),

        random,

        variant:
          this.variant,

        baseRadius:
          this.config.stardustBaseRadius,

        radialSpread:
          this.config.stardustRadialSpreadSymmetric,

        minSize:
          this.config.stardustMinSize,

        maxSize:
          this.config.stardustMaxSize,

        minOpacity:
          this.config.stardustMinOpacity,

        maxOpacity:
          this.config.stardustMaxOpacity

      });

    }


    else {

      createAsymmetricParticles({

        group:
          particles,

        particleStore:
          this.particles,

        count:

          this.getScaledParticleCount(
            this.config.stardustAsymmetricCount
          ),

        random,

        variant:
          this.variant,

        baseRadius:
          this.config.stardustBaseRadius,

        radialSpread:
          this.config.stardustRadialSpreadAsymmetric,

        minSize:
          this.config.stardustMinSize,

        maxSize:
          this.config.stardustMaxSize,

        minOpacity:
          this.config.stardustMinOpacity,

        maxOpacity:
          this.config.stardustMaxOpacity

      });

    }


    this.svg.appendChild(
      particles
    );


    this.periapsisRadius =

      this.getSafePeriapsisRadius();

  }



  /* ==========================================================
     REALISTIC GLOW
     ========================================================== */

  buildGlow() {

    this.centralBodyRadius =
      this.config.glowCentralBodyRadius;


    const distortedGlowFilterId =

      `orbit-distorted-glow-${this.id}`;


    const haloFilterId =

      `orbit-halo-${this.id}`;


    const defs =

      createSvgElement(
        "defs"
      );



    /* --------------------------------------------------------
       IMPERFECT / TURBULENT LIGHT FILTER
       -------------------------------------------------------- */

    const distortedGlowFilter =

      createSvgElement(

        "filter",

        {

          id:
            distortedGlowFilterId,

          x:
            "-90%",

          y:
            "-90%",

          width:
            "280%",

          height:
            "280%"

        }

      );


    const turbulence =

      createSvgElement(

        "feTurbulence",

        {

          type:
            "fractalNoise",

          baseFrequency:
            "0.025 0.04",

          numOctaves:
            2,

          seed:
            this.seed,

          result:
            "noise"

        }

      );


    const displacement =

      createSvgElement(

        "feDisplacementMap",

        {

          in:
            "SourceGraphic",

          in2:
            "noise",

          scale:
            1.55,

          xChannelSelector:
            "R",

          yChannelSelector:
            "G",

          result:
            "displaced"

        }

      );


    const glowBlur =

      createSvgElement(

        "feGaussianBlur",

        {

          in:
            "displaced",

          stdDeviation:
            1.65,

          result:
            "blur"

        }

      );


    const glowMerge =

      createSvgElement(
        "feMerge"
      );


    glowMerge.append(

      createSvgElement(

        "feMergeNode",

        {
          in:
            "blur"
        }

      ),


      createSvgElement(

        "feMergeNode",

        {
          in:
            "displaced"
        }

      )

    );


    distortedGlowFilter.append(

      turbulence,

      displacement,

      glowBlur,

      glowMerge

    );


    defs.appendChild(
      distortedGlowFilter
    );



    /* --------------------------------------------------------
       LARGE SOFT BLOOM FILTER
       -------------------------------------------------------- */

    const haloFilter =

      createSvgElement(

        "filter",

        {

          id:
            haloFilterId,

          x:
            "-120%",

          y:
            "-120%",

          width:
            "340%",

          height:
            "340%"

        }

      );


    const haloBlur =

      createSvgElement(

        "feGaussianBlur",

        {

          stdDeviation:
            5.6,

          result:
            "haloBlur"

        }

      );


    const haloMerge =

      createSvgElement(
        "feMerge"
      );


    haloMerge.append(

      createSvgElement(

        "feMergeNode",

        {
          in:
            "haloBlur"
        }

      ),


      createSvgElement(

        "feMergeNode",

        {
          in:
            "SourceGraphic"
        }

      )

    );


    haloFilter.append(

      haloBlur,

      haloMerge

    );


    defs.appendChild(
      haloFilter
    );


    this.svg.appendChild(
      defs
    );



    /* --------------------------------------------------------
       LARGE OUTER HALO
       -------------------------------------------------------- */

    const outerHalo =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius,

          fill:
            "none",

          stroke:
            "rgba(255, 226, 188, 0.22)",

          "stroke-width":
            8.5

        }

      );


    outerHalo.setAttribute(

      "filter",

      `url(#${haloFilterId})`

    );


    this.svg.appendChild(
      outerHalo
    );



    /* --------------------------------------------------------
       WARM MID HALO
       -------------------------------------------------------- */

    const warmHalo =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius,

          fill:
            "none",

          stroke:
            "rgba(255, 238, 210, 0.46)",

          "stroke-width":
            4.1

        }

      );


    warmHalo.setAttribute(

      "filter",

      `url(#${distortedGlowFilterId})`

    );


    this.svg.appendChild(
      warmHalo
    );



    /* --------------------------------------------------------
       IMPERFECT MAIN RING
       -------------------------------------------------------- */

    const irregularRing =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius,

          fill:
            "none",

          stroke:
            "rgba(255, 248, 232, 0.88)",

          "stroke-width":
            1.55

        }

      );


    irregularRing.setAttribute(

      "filter",

      `url(#${distortedGlowFilterId})`

    );


    this.svg.appendChild(
      irregularRing
    );



    /* --------------------------------------------------------
       INTENSE PRIMARY HOT ARC
       -------------------------------------------------------- */

    const hotArc =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius,

          fill:
            "none",

          stroke:
            "#fffdf6",

          "stroke-width":
            3.1,

          "stroke-linecap":
            "round",

          "stroke-dasharray":
            "73 125",

          transform:
            "rotate(-145 50 50)"

        }

      );


    hotArc.setAttribute(

      "filter",

      `url(#${distortedGlowFilterId})`

    );


    this.svg.appendChild(
      hotArc
    );



    /* --------------------------------------------------------
       SECONDARY HOT ARC
       -------------------------------------------------------- */

    const secondaryHotArc =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius +
            0.4,

          fill:
            "none",

          stroke:
            "rgba(255, 239, 207, 0.82)",

          "stroke-width":
            1.9,

          "stroke-linecap":
            "round",

          "stroke-dasharray":
            "36 162",

          transform:
            "rotate(-28 50 50)"

        }

      );


    secondaryHotArc.setAttribute(

      "filter",

      `url(#${distortedGlowFilterId})`

    );


    this.svg.appendChild(
      secondaryHotArc
    );



    /* --------------------------------------------------------
       THIN INNER CORE
       -------------------------------------------------------- */

    const coreRing =

      createSvgElement(

        "circle",

        {

          cx:
            50,

          cy:
            50,

          r:
            this.centralBodyRadius,

          fill:
            "none",

          stroke:
            "#fff9ef",

          "stroke-width":
            0.8

        }

      );


    coreRing.setAttribute(
      "opacity",
      "0.9"
    );


    this.svg.appendChild(
      coreRing
    );



    /* --------------------------------------------------------
       GLOW DUST FIELD
       -------------------------------------------------------- */

    const particles =

      createSvgElement(
        "g"
      );


    particles.classList.add(
      "orbit-glow-particles"
    );


    const random =

      mulberry32(
        this.seed
      );



    /* near-ring warm sparks */

    createGlowSpeckField({

      group:
        particles,

      particleStore:
        this.particles,

      random,

      count:

        this.getScaledParticleCount(
          this.config.glowNearSpeckCount
        ),

      baseRadius:
        33.4,

      radialSpread:
        2.8,

      minSize:
        0.1,

      maxSize:
        0.44,

      minOpacity:
        0.08,

      maxOpacity:
        0.5,

      color:
        "#fff1d8",

      amplitudeScale:
        0.62

    });



    /* wider faint particles */

    createGlowSpeckField({

      group:
        particles,

      particleStore:
        this.particles,

      random,

      count:

        this.getScaledParticleCount(
          this.config.glowFarSpeckCount
        ),

      baseRadius:
        35.5,

      radialSpread:
        3.8,

      minSize:
        0.07,

      maxSize:
        0.28,

      minOpacity:
        0.04,

      maxOpacity:
        0.22,

      color:
        "#fff7e9",

      amplitudeScale:
        0.82

    });



    /* --------------------------------------------------------
       ADDITIONAL STRUCTURED PARTICLES
       -------------------------------------------------------- */

    if (
      this.symmetry ===
      "symmetric"
    ) {

      createSymmetricParticles({

        group:
          particles,

        particleStore:
          this.particles,

        count:

          this.getScaledParticleCount(
            this.config.glowSymmetricCount
          ),

        random,

        variant:
          this.variant,

        baseRadius:
          32.7,

        radialSpread:
          1.6,

        minSize:
          0.1,

        maxSize:
          0.38,

        minOpacity:
          0.08,

        maxOpacity:
          0.38

      });

    }


    else {

      createAsymmetricParticles({

        group:
          particles,

        particleStore:
          this.particles,

        count:

          this.getScaledParticleCount(
            this.config.glowAsymmetricCount
          ),

        random,

        variant:
          this.variant,

        baseRadius:
          32.8,

        radialSpread:
          2.1,

        minSize:
          0.1,

        maxSize:
          0.42,

        minOpacity:
          0.07,

        maxOpacity:
          0.44

      });

    }


    this.svg.appendChild(
      particles
    );


    this.periapsisRadius =

      this.getSafePeriapsisRadius();

  }



  /* ==========================================================
     MINIMUM SAFE ORBIT DISTANCE
     ========================================================== */

  getSafePeriapsisRadius() {

    return (

      this.centralBodyRadius +

      this.moonRadius +

      this.clearance

    );

  }



  /* ==========================================================
     MOON
     ========================================================== */

  buildSatellite() {

    this.satellite =

      createSvgElement(
        "g"
      );


    this.satellite.classList.add(
      "orbit-satellite"
    );


    this.moon =

      createSvgElement(

        "circle",

        {

          cx:
            0,

          cy:
            0,

          r:
            this.moonRadius

        }

      );


    this.moon.classList.add(
      "orbit-moon"
    );


    this.satellite.appendChild(
      this.moon
    );


    this.svg.appendChild(
      this.satellite
    );

  }



  /* ==========================================================
     MOON POSITION
     ========================================================== */

  updateSatellite() {

    if (
      !this.satellite
    ) {
      return;
    }


    const position =

      keplerOrbitPosition({

        progress:
          this.progress,

        eccentricity:
          this.eccentricity,

        periapsisRadius:
          this.periapsisRadius,

        centerX:
          50,

        centerY:
          50,

        orientation:
          this.orientation,

        phase:
          -Math.PI /
          2

      });


    this.satellite.setAttribute(

      "transform",

      `translate(${position.x} ${position.y})`

    );


    this.lastOrbitData =
      position;

  }



  /* ==========================================================
     PARTICLE MOVEMENT
     ========================================================== */

  updateParticles() {

    const intensity =
      this.dustIntensity;


    if (

      !this.dustMotionEnabled ||

      intensity <=
      0

    ) {

      this.resetParticles();

      return;

    }


    const normalizedIntensity =

      intensity /
      10;



    /* --------------------------------------------------------
       CLOUD BREATHING
       -------------------------------------------------------- */

    const breathingAmplitude =

      0.04 +

      normalizedIntensity *
      0.22;


    const gentleBreathing =

      Math.sin(

        this.elapsedSeconds *
        0.2

      ) *

      breathingAmplitude;



    /* --------------------------------------------------------
       INDIVIDUAL PARTICLES
       -------------------------------------------------------- */

    for (
      const particle
      of this.particles
    ) {


      const normalX =

        Math.cos(
          particle.baseAngle
        );


      const normalY =

        Math.sin(
          particle.baseAngle
        );


      const tangentX =

        -Math.sin(
          particle.baseAngle
        );


      const tangentY =

        Math.cos(
          particle.baseAngle
        );



      /* radial travel */

      const radialOffset =

        Math.sin(

          this.elapsedSeconds *
          particle.speed +

          particle.phase

        ) *

        particle.radialAmplitude *

        intensity;



      /* tangential travel */

      const tangentialOffset =

        Math.cos(

          this.elapsedSeconds *

          (
            particle.speed *
            0.78
          )

          +

          particle.phase *
          1.17

        ) *

        particle.tangentialAmplitude *

        intensity;



      /* secondary organic drift */

      const secondaryDrift =

        Math.sin(

          this.elapsedSeconds *

          (
            particle.speed *
            0.31
          )

          +

          particle.phase *
          0.73

        ) *

        particle.tangentialAmplitude *

        intensity *

        0.22;



      const x =

        50 +

        normalX *

        (
          particle.baseRadius +

          radialOffset +

          gentleBreathing
        )

        +

        tangentX *

        (
          tangentialOffset +

          secondaryDrift
        );



      const y =

        50 +

        normalY *

        (
          particle.baseRadius +

          radialOffset +

          gentleBreathing
        )

        +

        tangentY *

        (
          tangentialOffset +

          secondaryDrift
        );



      /* ------------------------------------------------------
         BRIGHTNESS SHIMMER
         ------------------------------------------------------ */

      const shimmerStrength =

        0.035 +

        normalizedIntensity *
        0.095;



      const shimmer =

        1 +

        Math.sin(

          this.elapsedSeconds *
          particle.twinkleSpeed

          +

          particle.twinklePhase

        ) *

        shimmerStrength;



      const secondaryShimmer =

        1 +

        Math.sin(

          this.elapsedSeconds *
          particle.twinkleSpeed *
          0.37

          +

          particle.twinklePhase *
          1.61

        ) *

        (
          shimmerStrength *
          0.38
        );



      const brightness =

        shimmer *

        secondaryShimmer;



      const opacity =

        Math.max(

          0.02,

          Math.min(

            1,

            particle.baseOpacity *

            particle.opacityMultiplier *

            brightness

          )

        );



      /* ------------------------------------------------------
         APPARENT DEPTH / SIZE CHANGE
         ------------------------------------------------------ */

      const depthFactor =

        particle.layerIndex /
        2;


      const sizeVariation =

        (
          0.012 +

          normalizedIntensity *
          0.05
        ) *

        depthFactor;



      const size =

        particle.baseSize *

        (
          1 +

          Math.sin(

            this.elapsedSeconds *
            particle.twinkleSpeed *
            0.72

            +

            particle.twinklePhase

          ) *

          sizeVariation
        );



      particle.element.setAttribute(

        "cx",

        x.toFixed(
          3
        )

      );


      particle.element.setAttribute(

        "cy",

        y.toFixed(
          3
        )

      );


      particle.element.setAttribute(

        "r",

        size.toFixed(
          3
        )

      );


      particle.element.setAttribute(

        "opacity",

        opacity.toFixed(
          3
        )

      );

    }

  }



  /* ==========================================================
     STATIC DUST POSITION
     ========================================================== */

  resetParticles() {

    for (
      const particle
      of this.particles
    ) {

      particle.element.setAttribute(

        "cx",

        particle.baseX.toFixed(
          3
        )

      );


      particle.element.setAttribute(

        "cy",

        particle.baseY.toFixed(
          3
        )

      );


      particle.element.setAttribute(

        "r",

        particle.baseSize.toFixed(
          3
        )

      );


      particle.element.setAttribute(

        "opacity",

        particle.baseOpacity.toFixed(
          3
        )

      );

    }

  }



  /* ==========================================================
     ANIMATION LOOP
     ========================================================== */

  animate =
    currentTime => {


      const delta =

        Math.min(

          Math.max(

            currentTime -

            this.lastFrameTime,

            0

          ),

          50

        );


      this.lastFrameTime =
        currentTime;


      if (
        !this.paused
      ) {


        this.elapsedSeconds +=

          delta /
          1000;



        /* ----------------------------------------------------
           ORBIT

           Mean anomaly changes uniformly.

           orbit-math.js converts it to the
           non-uniform Keplerian movement.
           ---------------------------------------------------- */

        this.progress =

          (

            this.progress +

            this.directionMultiplier *

            (
              delta /

              (
                this.duration *
                1000
              )
            )

            +

            1

          ) %

          1;



        this.updateSatellite();



        if (
          this.dustMotionEnabled
        ) {

          this.updateParticles();

        }

      }



      this.animationFrame =

        requestAnimationFrame(
          this.animate
        );

    };



  /* ==========================================================
     LOGO TYPE
     ========================================================== */

  setVariant(
    variant,
    symmetry
  ) {

    if (

      ![
        "stardust",
        "glow"
      ].includes(
        variant
      )

    ) {
      return;
    }


    if (

      ![
        "symmetric",
        "asymmetric"
      ].includes(
        symmetry
      )

    ) {
      return;
    }


    this.variant =
      variant;


    this.symmetry =
      symmetry;


    this.svg.className.baseVal =
      "";


    this.svg.classList.add(

      "orbit-svg",

      `orbit-svg--${this.variant}`,

      `orbit-svg--${this.symmetry}`

    );


    this.build();

  }



  /* ==========================================================
     DURATION
     ========================================================== */

  setDuration(
    seconds
  ) {

    this.duration =

      Math.max(

        0.5,

        Number(
          seconds
        )

      );

  }



  /* ==========================================================
     ECCENTRICITY
     ========================================================== */

  setEccentricity(
    value
  ) {

    this.eccentricity =

      Math.min(

        0.45,

        Math.max(

          0,

          Number(
            value
          )

        )

      );


    this.updateSatellite();

  }



  /* ==========================================================
     DUST MOVEMENT
     ========================================================== */

  setDustMotionEnabled(
    enabled
  ) {

    this.dustMotionEnabled =

      Boolean(
        enabled
      );


    if (
      !this.dustMotionEnabled
    ) {

      this.resetParticles();

      return;

    }


    this.updateParticles();

  }



  /* ==========================================================
     DUST INTENSITY
     ========================================================== */

  setDustIntensity(
    value
  ) {

    this.dustIntensity =

      Math.min(

        10,

        Math.max(

          0,

          Number(
            value
          )

        )

      );


    if (

      !this.dustMotionEnabled ||

      this.dustIntensity ===
      0

    ) {

      this.resetParticles();

      return;

    }


    this.updateParticles();

  }



  /* ==========================================================
     DUST DENSITY
     ========================================================== */

  setDustDensity(
    value
  ) {

    this.dustDensity =

      Math.min(

        4,

        Math.max(

          0.25,

          Number(
            value
          )

        )

      );


    /*
     * Density changes particle COUNT,
     * therefore SVG needs to be rebuilt.
     */

    this.build();

  }



  /* ==========================================================
     DIRECTION
     ========================================================== */

  setDirection(
    direction
  ) {

    if (

      direction !==
      "right"

      &&

      direction !==
      "left"

    ) {
      return;
    }


    this.direction =
      direction;


    this.directionMultiplier =

      direction ===
        "left"

        ? -1

        : 1;

  }



  /* ==========================================================
     ORIENTATION
     ========================================================== */

  setOrientation(
    degreesValue
  ) {

    const value =

      Number(
        degreesValue
      );


    if (
      !Number.isFinite(
        value
      )
    ) {
      return;
    }


    this.orientation =

      value *

      Math.PI /

      180;


    this.updateSatellite();

  }



  /* ==========================================================
     MOON SIZE
     ========================================================== */

  setMoonRadius(
    value
  ) {

    const radius =

      Math.max(

        0.5,

        Number(
          value
        )

      );


    if (
      !Number.isFinite(
        radius
      )
    ) {
      return;
    }


    this.moonRadius =
      radius;


    if (
      this.moon
    ) {

      this.moon.setAttribute(

        "r",

        this.moonRadius

      );

    }


    this.periapsisRadius =

      this.getSafePeriapsisRadius();


    this.updateSatellite();

  }



  /* ==========================================================
     CLEARANCE
     ========================================================== */

  setClearance(
    value
  ) {

    const clearance =

      Math.max(

        0,

        Number(
          value
        )

      );


    if (
      !Number.isFinite(
        clearance
      )
    ) {
      return;
    }


    this.clearance =
      clearance;


    this.periapsisRadius =

      this.getSafePeriapsisRadius();


    this.updateSatellite();

  }



  /* ==========================================================
     PAUSE
     ========================================================== */

  setPaused(
    paused
  ) {

    this.paused =

      Boolean(
        paused
      );


    this.lastFrameTime =

      performance.now();

  }



  /* ==========================================================
     CLEANUP
     ========================================================== */

  destroy() {

    if (
      this.animationFrame
    ) {

      cancelAnimationFrame(
        this.animationFrame
      );

    }

  }

}