const CUBE_DIMENSION = 3;
const CUBIE_SIZE = 60;
const CUBIE_SPACING = 0;
const AXES_3D = ["x", "y", "z"];
const COLORS = ["green", "red", "blue", "orange", "white", "yellow"];
const FACES = {
  front: 0,
  right: 1,
  back: 2,
  left: 3,
  top: 4,
  bottom: 5,
};
const FACE_NORMALS = {
  [FACES.front]: [0, 0, 1], // Normal vector towards +z
  [FACES.right]: [1, 0, 0], // Normal vector towards +x
  [FACES.back]: [0, 0, -1], // Normal vector towards -z
  [FACES.left]: [-1, 0, 0], // Normal vector towards -x
  [FACES.top]: [0, 1, 0], // Normal vector towards +y
  [FACES.bottom]: [0, -1, 0], // Normal vector towards -y
};
const HALF_PI_ROTATION_MATRICES = {
  // Clockwise rotation (CW)
  true: {
    x: [
      [1, 0, 0],
      [0, 0, 1],
      [0, -1, 0],
    ],
    y: [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0],
    ],
    z: [
      [0, 1, 0],
      [-1, 0, 0],
      [0, 0, 1],
    ],
  },
  // Counter-clockwise rotation (CCW)
  false: {
    x: [
      [1, 0, 0],
      [0, 0, -1],
      [0, 1, 0],
    ],
    y: [
      [0, 0, 1],
      [0, 1, 0],
      [-1, 0, 0],
    ],
    z: [
      [0, -1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ],
  },
};

class RubikCube {
  cubieSize: number;
  dimension: number | undefined;
  cubies: Cubie[];

  constructor(cubieSize, dimension) {
    this.cubieSize = cubieSize;
    this.dimension = dimension;
    this.cubies = [];

    this._forEachAxisIndex(x =>
      this._forEachAxisIndex(y =>
        this._forEachAxisIndex(z =>
          this.cubies.push(new Cubie(this, x, y, z, cubieSize))
        )
      )
    );
  }

  axisLimit() {
    return (this.dimension - 1) / 2;
  }

  // render() {
  //   this.cubies.forEach((cubie) => cubie.render());
  // }

  // rotate(axis, axisIndex, clockwise) {
  //   const layerCubies = this.cubies.filter(
  //     (cubie) => cubie.position[axis] === axisIndex
  //   );

  //   const matrix = HALF_PI_ROTATION_MATRICES[clockwise][axis];

  //   layerCubies.forEach((cubie) => cubie.rotate(matrix));
  // }

  _forEachAxisIndex(fn) {
    for (let i = -this.axisLimit(); i <= this.axisLimit(); i++) fn(i);
  }
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

class Cubie {
  cube: RubikCube;
  position: Vector3D;
  size: number;
  faces: CubieFace[];

  constructor(cube, x, y, z, size) {
    this.cube = cube;
    this.position = { x, y, z };
    this.size = size;
    this.faces = repeat(
      6,
      i => new CubieFace(this, size, COLORS[i], FACE_NORMALS[i])
    );
  }

  isCorner = () => {
    const { x, y, z } = this.position;
    return [x, y, z].every(coord => Math.abs(coord) === this.cube.axisLimit());
  };

  isEdge = () => {
    const { x, y, z } = this.position;
    const axisLimit = this.cube.axisLimit();
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);

    return (
      (absX === axisLimit && absY === axisLimit && absZ < axisLimit) ||
      (absY === axisLimit && absZ === axisLimit && absX < axisLimit) ||
      (absX === axisLimit && absZ === axisLimit && absY < axisLimit)
    );
  };

  isUp = () => this.position.y === this.cube.axisLimit();
  isDown = () => this.position.y === -this.cube.axisLimit();
  isLeft = () => this.position.x === -this.cube.axisLimit();
  isRight = () => this.position.x === this.cube.axisLimit();
  isFront = () => this.position.z === this.cube.axisLimit();
  isBack = () => this.position.z === -this.cube.axisLimit();

  findFace = faceNormalIndex =>
    this.faces.find(face =>
      Cubie.sameArray(FACE_NORMALS[faceNormalIndex], face.normal)
    );

  static sameArray = (a, b) => a.every((v, i) => v === b[i]);

  static findFacesByColor = (cubies, color, faceNormalIndex) =>
    cubies.filter(cubie => cubie.findFace(faceNormalIndex).color === color);

  // render() {
  //   push();

  //   // Move to the center (in 3d) of the cubie.
  //   translate(
  //     this.position.x * (this.size + CUBIE_SPACING),
  //     this.position.y * (this.size + CUBIE_SPACING),
  //     this.position.z * (this.size + CUBIE_SPACING)
  //   );

  //   this.faces.forEach((face) => face.render());

  //   pop();
  // }

  // rotate(matrix) {
  //   [this.position[0], this.position.y, this.position.z] = matrixByVectorMult(
  //     matrix,
  //     this.position
  //   );

  //   this.faces.forEach((face) => face.rotate(matrix));
  // }
}

class CubieFace {
  cubie: Cubie;
  size: number;
  color: string;
  normal: Array<number>;

  constructor(
    cubie: Cubie,
    size: number,
    color: string,
    normal: Array<number>
  ) {
    this.cubie = cubie;
    this.size = size;
    this.color = color;
    this.normal = [...normal];
  }
  // render() {
  //   push();

  //   fill(this.color);

  //   // Move to the center of the 2d face.
  //   translate(
  //     (this.normal.x * this.size) / 2,
  //     (this.normal.y * this.size) / 2,
  //     (this.normal.z * this.size) / 2
  //   );

  //   strokeWeight(5);

  //   box(
  //     abs(this.normal.x) === 1 ? 0 : this.size,
  //     abs(this.normal.y) === 1 ? 0 : this.size,
  //     abs(this.normal.z) === 1 ? 0 : this.size
  //   );

  //   pop();
  // }

  rotate(matrix) {
    [this.normal[0], this.normal[1], this.normal[2]] = matrixByVectorMult(
      matrix,
      this.normal
    );
  }
}

function repeat(times, fn) {
  const result = [];

  for (let i = 0; i < times; i++) result.push(fn(i));

  return result;
}

function matrixByVectorMult(matrix, array) {
  return matrix.map(row =>
    row.reduce((acc, value, i) => acc + value * array[i], 0)
  );
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// https://en.wikipedia.org/wiki/Transformation_matrix#Rotation_2
// [l, m, n] represents the rotation axis used.
// Notice that this function IS NOT used in this project,
function calculateRotationMatrix(l, m, n, theta) {
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  return [
    [
      l * l * (1 - cosT) + cosT,
      m * l * (1 - cosT) - n * sinT,
      n * l * (1 - cosT) + m * sinT,
    ],
    [
      l * m * (1 - cosT) + n * sinT,
      m * m * (1 - cosT) + cosT,
      n * m * (1 - cosT) - l * sinT,
    ],
    [
      l * n * (1 - cosT) - m * sinT,
      m * n * (1 - cosT) + l * sinT,
      n * n * (1 - cosT) + cosT,
    ],
  ];
}

// CROSS METHOD of solving the 3X3 Cube (human):
type ListOfMoves = Array<string>;

interface CubeSolution {
  solvedCube: RubikCube;
  solutionMoves: ListOfMoves;
}

export const solve3by3Cube = (cube: RubikCube): CubeSolution => {
  // Wrong dimension causes error
  if (cube.dimension !== 3) throw console.error("Cube must be 3x3");

  // Initialize the cube and solution array
  const solutionMoves = [] as string[];
  const solvedCube = new RubikCube(CUBIE_SIZE, 3);

  // Step 1: CROSS SOLVING
  // Consider first layer only
  const upperLayerEdges = cube.cubies
    .filter(cubie => cubie.isUp())
    .filter(cubie => cubie.isEdge());

  // const whiteEdgesCubiesOnUpperLayer = upperLayerEdges.filter(
  //   cubie => cubie.findFace(FACES.top).color === "white"
  // );

  const whiteEdgesCubiesOnUpperLayer = Cubie.findFacesByColor(
    upperLayerEdges,
    "white",
    FACES.top
  );

  // colorsFound.forEach((color) =>

  //   if (for color in colorsFound) {
  //     nextStep();
  //   } else {
  //     U until colorsFound[0] === color_from_cubie_face_below_other_edge_face
  //   }

  // Step 2:

  // Step 3:

  return {
    solvedCube,
    solutionMoves,
  };
};
