export const TAU =
  Math.PI * 2;


/**
 * Normalize an angle into 0 → 2π.
 */
export function normalizeAngle(
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


/**
 * Solve Kepler's equation:
 *
 * M = E - e sin(E)
 */
export function solveEccentricAnomaly(
  meanAnomaly,
  eccentricity,
  tolerance = 1e-10
) {

  const e =
    Math.min(
      0.95,
      Math.max(
        0,
        eccentricity
      )
    );


  const M =
    normalizeAngle(
      meanAnomaly
    );


  let E =
    e < 0.8
      ? M
      : Math.PI;


  for (
    let iteration = 0;
    iteration < 20;
    iteration += 1
  ) {

    const f =
      E -
      e *
      Math.sin(E) -
      M;


    const derivative =
      1 -
      e *
      Math.cos(E);


    const nextE =
      E -
      f /
      derivative;


    if (
      Math.abs(
        nextE -
        E
      ) <
      tolerance
    ) {
      return nextE;
    }


    E =
      nextE;

  }


  return E;
}


/**
 * Calculate a Keplerian elliptical orbit.
 *
 * The logo center is one focus.
 *
 * Periapsis remains fixed while eccentricity
 * increases, so increasing ellipticity expands
 * the far side instead of pushing the moon into
 * the central logo.
 */
export function keplerOrbitPosition({

  progress,

  eccentricity,

  periapsisRadius,

  centerX = 50,
  centerY = 50,

  orientation = 0,

  phase = 0

}) {

  const e =
    Math.min(
      0.8,

      Math.max(
        0,
        eccentricity
      )
    );


  /*
   * q = a(1 - e)
   *
   * q = periapsis
   * a = semi-major axis
   */

  const semiMajorAxis =

    periapsisRadius /

    (
      1 -
      e
    );


  const semiMinorAxis =

    semiMajorAxis *

    Math.sqrt(
      1 -
      e *
      e
    );


  /*
   * Mean anomaly advances uniformly with time.
   */

  const meanAnomaly =

    normalizeAngle(

      progress *
      TAU +

      phase

    );


  /*
   * Solve Kepler equation.
   */

  const eccentricAnomaly =

    solveEccentricAnomaly(

      meanAnomaly,

      e

    );


  /*
   * Ellipse coordinates with the origin
   * located at one focus.
   */

  const orbitalX =

    semiMajorAxis *

    (
      Math.cos(
        eccentricAnomaly
      ) -
      e
    );


  const orbitalY =

    semiMinorAxis *

    Math.sin(
      eccentricAnomaly
    );


  /*
   * Rotate the ellipse.
   */

  const cosOrientation =
    Math.cos(
      orientation
    );


  const sinOrientation =
    Math.sin(
      orientation
    );


  const rotatedX =

    orbitalX *
      cosOrientation -

    orbitalY *
      sinOrientation;


  const rotatedY =

    orbitalX *
      sinOrientation +

    orbitalY *
      cosOrientation;


  const x =
    centerX +
    rotatedX;


  const y =
    centerY +
    rotatedY;


  const distanceFromCenter =

    Math.hypot(

      rotatedX,

      rotatedY

    );


  const apoapsisRadius =

    semiMajorAxis *

    (
      1 +
      e
    );


  return {

    x,

    y,

    distanceFromCenter,

    periapsisRadius,

    apoapsisRadius,

    semiMajorAxis,

    semiMinorAxis,

    eccentricAnomaly

  };

}