// sketch.js
let sketch = function(p) {
  /***********************************************/
  /*** CONFIGURATION ***/
  /***********************************************/
  let CANVAS_WIDTH;    
  let CANVAS_HEIGHT;
  
  const GLOBAL_SCALE    = 1;      
  const OFFSET_X        = 0;      
  const OFFSET_Y        = 0;      
  const LAYERS          = 50; // Target value
  const ANGLE_STEP      = 5;  // Target value
  
  let BASE_RADIUS;     // Will be calculated by calculateDynamicDimensions
  let NOISE_AMOUNT;    // Will be calculated by calculateDynamicDimensions
  let HOVER_RADIUS;    // Will be calculated by calculateDynamicDimensions
  
  const NOISE_SCALE     = 0.55; 
  const HOVER_PULL      = 1.2;  // Target value
  
  // --- Parameters for the RGB tint color palette ---
  const COLOR_SPEED     = 0.01; 
  const TINT_VALUE      = 200;  
  const ALPHA           = 50;   
  
  // STROKE_WEIGHT will be fixed
  const FIXED_STROKE_WEIGHT = 2;

  /***********************************************/
  /*** INTERNAL STATE ***/
  /***********************************************/
  let ox = p.random(10000), oy = p.random(10000), oz = p.random(10000);
  let colorT = 0; 
  let hoverActive = false;
  let hoverX = 0, hoverY = 0;
  let parentElement; 

  // Using the more robust calculateDynamicDimensions
  function calculateDynamicDimensions() {
    if (!parentElement) {
        parentElement = document.getElementById('canvas-holder');
    }
    
    CANVAS_WIDTH = parentElement.offsetWidth;
    CANVAS_HEIGHT = parentElement.offsetHeight;

    const smallestDimension = p.min(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Proportional sizing based on the canvas-holder's smallest dimension
    // Adjust these multipliers as needed to get the desired relative size
    BASE_RADIUS = smallestDimension * 0.38; // Example multiplier, adjust to taste
    NOISE_AMOUNT = smallestDimension * 0.22; // Example multiplier
    HOVER_RADIUS = smallestDimension * 0.20; // Example multiplier
    
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  }

  p.setup = function() {
    parentElement = document.getElementById('canvas-holder'); // Ensure parentElement is set for first calculation
    const dimensions = calculateDynamicDimensions();
    
    let cnv = p.createCanvas(dimensions.width, dimensions.height);
    cnv.parent('canvas-holder'); 

    p.strokeWeight(FIXED_STROKE_WEIGHT); // Use fixed stroke weight
    p.smooth();
    p.noFill();
  };
  
  p.windowResized = function() {
    const dimensions = calculateDynamicDimensions();
    p.resizeCanvas(dimensions.width, dimensions.height);
    // Fixed stroke weight remains, no need to reset here unless it were dynamic
  };

  p.draw = function() {
    p.background(0); 

    p.push();
      p.translate(p.width/2 + OFFSET_X, p.height/2 + OFFSET_Y);
      p.scale(GLOBAL_SCALE);

      updateHover();
      updateColorAndNoise(); 
      drawRibbon();
    p.pop();
  };

  function updateHover() {
    if (p.mouseX >= 0 && p.mouseX <= p.width && 
        p.mouseY >= 0 && p.mouseY <= p.height) {
      hoverActive = true;
      hoverX = p.mouseX - p.width/2  - OFFSET_X; 
      hoverY = p.mouseY - p.height/2 - OFFSET_Y; 
    } else {
      hoverActive = false;
    }
  }

  function updateColorAndNoise() {
    colorT = (colorT + COLOR_SPEED) % 1;
    ox += 0.01; 
    oy += 0.01; 
    oz += 0.007; 
  }

  function drawRibbon() {
    for (let i = 0; i < LAYERS; i++) {
      p.beginShape();
      
      const phaseOffset = i * 0.02;

      for (let angle = 0; angle < 360; angle += ANGLE_STEP) { 
        const rad = p.radians(angle);

        const n = p.noise(
          ox + p.cos(rad) * NOISE_SCALE,
          oy + p.sin(rad) * NOISE_SCALE,
          oz + phaseOffset 
        );
        const r0 = BASE_RADIUS + p.map(n, 0, 1, -NOISE_AMOUNT, NOISE_AMOUNT);

        let x = r0 * p.cos(rad);
        let y = r0 * p.sin(rad);

        if (hoverActive) {
          const d = p.dist(x, y, hoverX / GLOBAL_SCALE, hoverY / GLOBAL_SCALE); 
          if (d < HOVER_RADIUS) {
            let influence = p.map(d, 0, HOVER_RADIUS, 1, 0);
            influence = p.pow(influence, 1.5); // Target exponent
            x += (hoverX / GLOBAL_SCALE - x) * influence * HOVER_PULL;
            y += (hoverY / GLOBAL_SCALE - y) * influence * HOVER_PULL;
          }
        }
        
        // RGB tint color logic
        const phase = (colorT + phaseOffset) % 1;
        let rC, gC, bC;
        
        if (phase < 0.25) {
          const t = phase * 4;
          rC = 255; gC = 255; bC = p.lerp(255, TINT_VALUE, t);
        } else if (phase < 0.5) {
          const t = (phase - 0.25) * 4;
          rC = 255; gC = p.lerp(255, TINT_VALUE, t); bC = 255;
        } else if (phase < 0.75) {
          const t = (phase - 0.5) * 4;
          rC = p.lerp(255, TINT_VALUE, t); gC = 255; bC = 255;
        } else {
          rC = 255; gC = 255; bC = 255;
        }

        p.stroke(rC, gC, bC, ALPHA);
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }
  }
};

new p5(sketch);
