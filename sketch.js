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
  const LAYERS          = 50; 
  const ANGLE_STEP      = 5;  
  
  let BASE_RADIUS;     
  let NOISE_AMOUNT;    
  let HOVER_RADIUS;    
  
  const NOISE_SCALE     = 0.55; 
  const HOVER_PULL      = 1.2;  
  
  // --- Parameters for the new metallic color palette ---
  const COLOR_SPEED     = 0.01; 
  const SHINY_ALPHA     = 80;   
  
  const FIXED_STROKE_WEIGHT = 2;

  // Define colors (will be initialized in setup)
  let silverBaseColor;
  // NEW: Define white and grey hint colors
  let whiteHintColor;
  let midGreyHintColor;
  let darkGreyHintColor; 
  // OLD: purpleHintColor, greenHintColor, yellowHintColor are removed/replaced

  /***********************************************/
  /*** INTERNAL STATE ***/
  /***********************************************/
  let ox = p.random(10000), oy = p.random(10000), oz = p.random(10000);
  let colorT = 0; 
  let hoverActive = false;
  let hoverX = 0, hoverY = 0;
  let parentElement; 

  function calculateDynamicDimensions() {
    if (!parentElement) {
        parentElement = document.getElementById('canvas-holder');
    }
    
    CANVAS_WIDTH = parentElement.offsetWidth;
    CANVAS_HEIGHT = parentElement.offsetHeight;

    const smallestDimension = p.min(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    BASE_RADIUS = smallestDimension * 0.38; 
    NOISE_AMOUNT = smallestDimension * 0.22; 
    HOVER_RADIUS = smallestDimension * 0.20; 
    
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  }

  p.setup = function() {
    parentElement = document.getElementById('canvas-holder'); 
    const dimensions = calculateDynamicDimensions();
    
    let cnv = p.createCanvas(dimensions.width, dimensions.height);
    cnv.parent('canvas-holder'); 

    p.strokeWeight(FIXED_STROKE_WEIGHT); 
    p.smooth();
    p.noFill();

    // Initialize colors
    silverBaseColor = p.color(220, 220, 230);      // Cool, bright silver (remains the base)
    
    // NEW: Initialize white and grey hint colors
    whiteHintColor    = p.color(255, 255, 255);    // Pure white hint
    midGreyHintColor  = p.color(160, 160, 170);    // A medium grey with a slight cool tint
    darkGreyHintColor = p.color(100, 100, 110);    // A darker grey, also slightly cool
  };
  
  p.windowResized = function() {
    const dimensions = calculateDynamicDimensions();
    p.resizeCanvas(dimensions.width, dimensions.height);
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
      
      const layerSpecificPhase = (colorT + i * 0.02) % 1.0; 
      let finalColor;

      // Determine color based on the layerSpecificPhase
      // The phase is divided into three segments for the white/grey hints
      if (layerSpecificPhase < 0.333) {
          let t_segment = layerSpecificPhase / 0.333; 
          let hintIntensity = p.sin(t_segment * p.PI) * 0.70; // Max 70% blend for hints
          finalColor = p.lerpColor(silverBaseColor, whiteHintColor, hintIntensity); // Blend with white
      } else if (layerSpecificPhase < 0.666) {
          let t_segment = (layerSpecificPhase - 0.333) / 0.333; 
          let hintIntensity = p.sin(t_segment * p.PI) * 0.70;
          finalColor = p.lerpColor(silverBaseColor, midGreyHintColor, hintIntensity); // Blend with mid-grey
      } else {
          let t_segment = (layerSpecificPhase - 0.666) / 0.334; 
          let hintIntensity = p.sin(t_segment * p.PI) * 0.70;
          finalColor = p.lerpColor(silverBaseColor, darkGreyHintColor, hintIntensity); // Blend with dark-grey
      }

      p.stroke(p.red(finalColor), p.green(finalColor), p.blue(finalColor), SHINY_ALPHA);

      for (let angle = 0; angle < 360; angle += ANGLE_STEP) { 
        const rad = p.radians(angle);

        const n = p.noise(
          ox + p.cos(rad) * NOISE_SCALE,
          oy + p.sin(rad) * NOISE_SCALE,
          oz + (i * 0.02) 
        );
        const r0 = BASE_RADIUS + p.map(n, 0, 1, -NOISE_AMOUNT, NOISE_AMOUNT);

        let x = r0 * p.cos(rad);
        let y = r0 * p.sin(rad);

        if (hoverActive) {
          const d = p.dist(x, y, hoverX / GLOBAL_SCALE, hoverY / GLOBAL_SCALE); 
          if (d < HOVER_RADIUS) {
            let influence = p.map(d, 0, HOVER_RADIUS, 1, 0);
            influence = p.pow(influence, 1.5); 
            x += (hoverX / GLOBAL_SCALE - x) * influence * HOVER_PULL;
            y += (hoverY / GLOBAL_SCALE - y) * influence * HOVER_PULL;
          }
        }
        
        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }
  }
};

new p5(sketch);
