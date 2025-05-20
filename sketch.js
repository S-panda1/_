// sketch.js
let sketch = function(p) {
  /***********************************************/
  /*** CONFIGURATION ***/
  /***********************************************/
  // These will be calculated dynamically now
  let CANVAS_WIDTH;    
  let CANVAS_HEIGHT;
  
  // The rest of the constants can be relative
  const GLOBAL_SCALE    = 1;      // shrink (<1) or enlarge (>1)
  const OFFSET_X        = 0;      // horizontal shift
  const OFFSET_Y        = 0;      // vertical shift
  const LAYERS          = 40;     // ribbon layers
  const ANGLE_STEP      = 5;      // smoothness
  
  // BASE_RADIUS will be calculated dynamically
  let BASE_RADIUS;     // before noise
  
  const NOISE_SCALE     = 0.55;   // noise frequency
  let NOISE_AMOUNT;    // noise amplitude - will be calculated dynamically
  let HOVER_RADIUS;    // cursor influence radius - will be calculated dynamically
  const HOVER_PULL      = 1.5;    // cursor pull strength
  const COLOR_SPEED     = 0.01;  // hue shift speed
  const ALPHA           = 50;     // line transparency

  /***********************************************/
  /*** INTERNAL STATE ***/
  /***********************************************/
  let ox = p.random(10000), oy = p.random(10000), oz = p.random(10000);
  let colorT = 0;
  let hoverActive = false;
  let hoverX = 0, hoverY = 0;
  
  // Function to calculate sizes based on screen dimensions
  function calculateDimensions() {
    // Get the parent element dimensions
    const parentElement = document.getElementById('canvas-holder');
    
    // Get window dimensions
    const windowWidth = window.innerWidth;
    
    // Set base dimensions relative to window size
    if (windowWidth >= 1600) {
      CANVAS_WIDTH = 900;
      CANVAS_HEIGHT = 780;
      BASE_RADIUS = 300;
      NOISE_AMOUNT = 200;
      HOVER_RADIUS = 150;
    } else if (windowWidth >= 1200) {
      CANVAS_WIDTH = 700;
      CANVAS_HEIGHT = 570;
      BASE_RADIUS = 220;
      NOISE_AMOUNT = 180;
      HOVER_RADIUS = 140;
    } else if (windowWidth >= 992) {
      CANVAS_WIDTH = 600;
      CANVAS_HEIGHT = 500;
      BASE_RADIUS = 180;
      NOISE_AMOUNT = 150;
      HOVER_RADIUS = 120;
    } else {
      CANVAS_WIDTH = 400;
      CANVAS_HEIGHT = 400;
      BASE_RADIUS = 150;
      NOISE_AMOUNT = 100;
      HOVER_RADIUS = 100;
    }
    
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  }

  p.setup = function() {
    // Calculate dimensions first
    const dimensions = calculateDimensions();
    
    // 1) create the canvas with calculated dimensions
    let cnv = p.createCanvas(dimensions.width, dimensions.height);
    
    // 2) move it into your holder DIV
    cnv.parent('canvas-holder');

    p.strokeWeight(2);
    p.smooth();
    p.noFill();
  };
  
  // Handle window resize
  p.windowResized = function() {
    const dimensions = calculateDimensions();
    p.resizeCanvas(dimensions.width, dimensions.height);
  };

  p.draw = function() {
    p.background(0);  // black

    p.push();
      // center & apply any offsets/scale
      p.translate(p.width/2 + OFFSET_X, p.height/2 + OFFSET_Y);
      p.scale(GLOBAL_SCALE);

      updateHover();
      updateColor();
      drawRibbon();
    p.pop();
  };

  function updateHover() {
    if (p.mouseX >= 0 && p.mouseX <= p.width
     && p.mouseY >= 0 && p.mouseY <= p.height) {
      hoverActive = true;
      // compute cursor in canvas-centered coords
      hoverX = p.mouseX - p.width/2  - OFFSET_X;
      hoverY = p.mouseY - p.height/2 - OFFSET_Y;
    } else {
      hoverActive = false;
    }
  }

  function updateColor() {
    colorT = (colorT + COLOR_SPEED) % 1;
    ox += 0.01; oy += 0.01; oz += 0.007;
  }

  function drawRibbon() {
    for (let i = 0; i < LAYERS; i++) {
      p.beginShape();
      const phaseOffset = i * 0.02;

      for (let angle = 0; angle < 360; angle += ANGLE_STEP) {
        const rad = p.radians(angle);

        // noise radius
        const n = p.noise(
          ox + p.cos(rad)*NOISE_SCALE,
          oy + p.sin(rad)*NOISE_SCALE,
          oz + phaseOffset
        );
        const r0 = BASE_RADIUS + p.map(n, 0, 1, -NOISE_AMOUNT, NOISE_AMOUNT);

        // base vertex
        let x = r0 * p.cos(rad);
        let y = r0 * p.sin(rad);

        // pull toward cursor
        if (hoverActive) {
          const d = p.dist(x, y, hoverX, hoverY);
          if (d < HOVER_RADIUS) {
            let influence = p.map(d, 0, HOVER_RADIUS, 1, 0);
            influence = p.pow(influence, 1.5);
            x += (hoverX - x) * influence * HOVER_PULL;
            y += (hoverY - y) * influence * HOVER_PULL;
          }
        }

        // white + tint coloring
        const phase = (colorT + phaseOffset) % 1;
        let rC, gC, bC;
        const tint = 200; // light tint
        if (phase < 0.25) {
          const t = phase * 4;
          rC = 255; gC = 255; bC = p.lerp(255, tint, t);
        } else if (phase < 0.5) {
          const t = (phase - 0.25) * 4;
          rC = 255; gC = p.lerp(255, tint, t); bC = 255;
        } else if (phase < 0.75) {
          const t = (phase - 0.5) * 4;
          rC = p.lerp(255, tint, t); gC = 255; bC = 255;
        } else {
          rC = gC = bC = 255;
        }

        p.stroke(rC, gC, bC, ALPHA);
        p.vertex(x, y);
      }

      p.endShape(p.CLOSE);
    }
  }

};  // end sketch

new p5(sketch);
