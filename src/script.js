const sizes = {
  width: 800,
  height: 800,
};

const config = {
  seed: "wasim almadfaa",
  minPictureFrameSize: 5,
  maxPictureFrameSize: 75,
  minPictureFrameBorderSize: 0.2,
  maxPictureFrameBorderSize: 2,
  totalAttractionPoints: 0,
  totalPictureFrames: 35,
  totalSortingPictureFramesIterations: 9,
};

const lightSource = {
  x: 0,
  y: 0,
};

// Generators
function generatePictureFramesAttractionPoints(num, areaSize) {
  // prettier-ignore
  return array(num).map(() => [
      -(areaSize / 2) + $random.next() * areaSize,
      -(areaSize / 2) + $random.next() * areaSize
  ]);
}

function generatePictureFramesCords(num, areaSize, minRectSize, maxRectSize) {
  const grid = Math.ceil(Math.sqrt(num));
  const filledSpace = areaSize + areaSize / 6;
  // prettier-ignore
  return array(num).map(i => [
    (-(filledSpace / 2) + (i % grid) * (filledSpace / grid)) | 0,
    (-(filledSpace / 2) + ((i / grid) | 0) * (filledSpace / grid)) | 0,
    (minRectSize + $random.next() * (maxRectSize - minRectSize)) | 0,
    (minRectSize + $random.next() * (maxRectSize - minRectSize)) | 0,
  ])
}

// Algorithms
function sortPictureFrames(pictureFrames, attractionPoints, iterationsCount) {
  for (const iteration of array(iterationsCount)) {
    $random.shuffle(pictureFrames);

    let attractionPoint = pictureFrames.reduce(
      (prev, curr, _, arr) => {
        prev[0] += (curr[0] + curr[2] / 2) / arr.length;
        prev[1] += (curr[1] + curr[3] / 2) / arr.length;
        return prev;
      },
      [0, 0]
    );

    for (const currPictureFrame of pictureFrames) {
      if (attractionPoints.length) {
        attractionPoint = attractionPoints[Math.floor($random.next() * attractionPoints.length)];
      }

      const prevPictureFrame = [0, 0, 0, 0];

      array(50).forEach(() => {
        copyArrayFromTo(currPictureFrame, prevPictureFrame);

        if ($random.next() > 0.5) {
          if (currPictureFrame[0] < attractionPoint[0]) currPictureFrame[0] += 1;
          else currPictureFrame[0] -= 1;
          if (currPictureFrame[1] < attractionPoint[1]) currPictureFrame[1] += 1;
          else currPictureFrame[1] -= 1;
        }

        for (const pictureFrame of pictureFrames) {
          if (pictureFrame !== currPictureFrame) {
            const [r1x, r1y, r1w, r1h] = currPictureFrame;
            const [r2x, r2y, r2w, r2h] = pictureFrame;

            if (!(r1x > r2x + r2w || r1x + r1w < r2x || r1y > r2y + r2h || r1y + r1h < r2y)) {
              copyArrayFromTo(prevPictureFrame, currPictureFrame);
              return;
            }
          }
        }
      });
    }
  }
}

// Shapes

function pictureFrameShadow(x, y, w, h) {
  const { minSize, maxSize, minFrameBorderSize, maxFrameBorderSize } = config;
  const [sx, sy] = calcShadowOf(x, y, w, h, minSize, maxSize, lightSource);
  const [width, height] = calcFrameBorderSize(w, h, minSize, maxSize, minFrameBorderSize, maxFrameBorderSize);

  noStroke();
  rect(x + sx, y + sy, width, height);
}

function pictureFrame(x, y, w, h) {
  const { minPictureFrameSize, maxPictureFrameSize, minPictureFrameBorderSize, maxPictureFrameBorderSize } = config;
  const [, , borderSize] = calcFrameBorderSize(
    w,
    h,
    minPictureFrameSize,
    maxPictureFrameSize,
    minPictureFrameBorderSize,
    maxPictureFrameBorderSize
  );

  strokeWeight(borderSize);
  rect(x, y, w, h);
}

// Utils
const $random = new SeedRandom(config.seed);

function calcShadowOf(x, y, w, h, minRectSize, maxRectSize, lightSource) {
  const hvx = map(w, minRectSize, maxRectSize, 0.5, 5, true);
  const hvy = map(h, minRectSize, maxRectSize, 0.5, 5, true);
  const hx = map(lightSource.x, 0, w, -hvx, hvx);
  const hy = map(lightSource.y, 0, h, -hvy, hvy);

  return [hx, hy];
}

function calcFrameBorderSize(w, h, minRectSize, maxRectSize, minFrameBorderSize, maxFrameBorderSize) {
  const size = map(w + h, minRectSize, maxRectSize, minFrameBorderSize, maxFrameBorderSize);
  return [w + size, h + size, size];
}

function array(length) {
  return Array.from(Array(length).keys());
}

function copyArrayFromTo(from, to) {
  from.forEach((item, i) => {
    to[i] = item;
  });
}

// Program

let pictureFrames;

function setup() {
  createCanvas(sizes.width, sizes.height);
  background(35);
  const areaSize = sizes.width;
  let attractionPoints = generatePictureFramesAttractionPoints(config.totalAttractionPoints, areaSize);
  pictureFrames = generatePictureFramesCords(
    config.totalPictureFrames,
    areaSize,
    config.minPictureFrameSize,
    config.maxPictureFrameSize
  );
  sortPictureFrames(pictureFrames, attractionPoints, config.totalSortingPictureFramesIterations);
  noLoop();
}

function draw() {
  translate(width / 2, height / 2);
  for (const [x, y, w, h] of pictureFrames) {
    pictureFrame(x, y, w, h);
  }
}
