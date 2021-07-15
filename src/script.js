const sizes = {
  width: 800,
  height: 800,
};

const config = {
  minFrameSize: $random.between(17, 21),
  maxFrameSize: $random.between(65, 98),
  minFrameBorderSize: 0.2,
  maxFrameBorderSize: 2,
  totalAttractionPoints: $random.between(0, 3),
  totalFrames: $random.between(13, 43),
  totalSortingFramesIterations: $random.between(0, 50),
};

const lightSource = {
  x: 0,
  y: 0,
};

// Generators
function generateFramesAttractionPoints(num, areaSize) {
  // prettier-ignore
  return array(num).map(() => [
      -(areaSize / 2) + $random.next() * areaSize,
      -(areaSize / 2) + $random.next() * areaSize
  ]);
}

function generateFramesCords(num, areaSize, minRectSize, maxRectSize) {
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
function sortFrames(frames, attractionPoints, iterationsCount) {
  for (const iteration of array(iterationsCount)) {
    $random.shuffle(frames);

    let attractionPoint = frames.reduce(
      (prev, curr, _, arr) => {
        prev[0] += (curr[0] + curr[2] / 2) / arr.length;
        prev[1] += (curr[1] + curr[3] / 2) / arr.length;
        return prev;
      },
      [0, 0]
    );

    for (const currFrame of frames) {
      if (attractionPoints.length) {
        attractionPoint = attractionPoints[Math.floor($random.next() * attractionPoints.length)];
      }

      const prevFrame = [0, 0, 0, 0];

      array(50).forEach(() => {
        copyArrayFromTo(currFrame, prevFrame);

        const probability = $random.next();

        if (probability < 0.3) {
          if (currFrame[0] < attractionPoint[0]) currFrame[0] += $random.between(1, 3);
          else currFrame[0] -= $random.between(1, 3);
          if (currFrame[1] < attractionPoint[1]) currFrame[1] += $random.between(1, 3);
          else currFrame[1] -= $random.between(1, 3);
        }
        if (probability > 0.5) {
          if (currFrame[0] < attractionPoint[0]) currFrame[0] += 1;
          else currFrame[0] -= 1;
          if (currFrame[1] < attractionPoint[1]) currFrame[1] += 1;
          else currFrame[1] -= 1;
        }
        if (probability > 0.7) {
          if (currFrame[0] < attractionPoint[0]) currFrame[0] += 2;
          else currFrame[0] -= 3;
          if (currFrame[1] < attractionPoint[1]) currFrame[1] += 4;
          else currFrame[1] -= 1;
        }

        for (const frame of frames) {
          if (frame !== currFrame) {
            const [r1x, r1y, r1w, r1h] = currFrame;
            const [r2x, r2y, r2w, r2h] = frame;

            if (!(r1x > r2x + r2w || r1x + r1w < r2x || r1y > r2y + r2h || r1y + r1h < r2y)) {
              copyArrayFromTo(prevFrame, currFrame);
              return;
            }
          }
        }
      });
    }
  }
}

// Shapes

function frameShadow(x, y, w, h) {
  const { minSize, maxSize, minFrameBorderSize, maxFrameBorderSize } = config;
  const [sx, sy] = calcShadowOf(x, y, w, h, minSize, maxSize, lightSource);
  const [width, height] = calcFrameBorderSize(w, h, minSize, maxSize, minFrameBorderSize, maxFrameBorderSize);

  noStroke();
  rect(x + sx, y + sy, width, height);
}

function frame(x, y, w, h) {
  const { minFrameSize, maxFrameSize, minFrameBorderSize, maxFrameBorderSize } = config;
  const [, , borderSize] = calcFrameBorderSize(
    w,
    h,
    minFrameSize,
    maxFrameSize,
    minFrameBorderSize,
    maxFrameBorderSize
  );

  strokeWeight(0.5);
  stroke(1, 75);
  beginShape(LINES);
  for (const index of array(Math.floor(w / 2))) {
    vertex(x + index * 2 + 1, y + borderSize);
    vertex(x + index * 2 + 1, y + h);
  }
  endShape();

  // rect(x, y, w, h);
  strokeWeight(borderSize);
  stroke(250);
  triangle(x + w / 2, y, x, y + h, x + w, y + h);
}

// Utils

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

let frames;

function setup() {
  createCanvas(sizes.width, sizes.height);
  background(255);
  // $grd.shape(width, height).gradient(1);
  // rect(0, 0, width, height);
  const areaSize = Math.sqrt(sizes.width * sizes.height) - 250;
  let attractionPoints = generateFramesAttractionPoints(config.totalAttractionPoints, areaSize);
  frames = generateFramesCords(config.totalFrames, areaSize, config.minFrameSize, config.maxFrameSize);
  sortFrames(frames, attractionPoints, config.totalSortingFramesIterations);
  noLoop();
}

function draw() {
  translate(width / 2, height / 2);
  for (let [x, y, w, h] of frames) {
    w -= 4;
    h -= 4;

    fill(35);
    frame(x, y, w, h);
  }
}
