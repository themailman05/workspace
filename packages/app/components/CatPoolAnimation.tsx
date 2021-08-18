import { truncate } from "fs/promises";
import React, { useRef, useEffect } from "react";

const PureCanvas = React.forwardRef((props, ref) => <canvas ref={ref} />);

var imagesLoaded = {
  "catPoolCloud": false, 
  "catPoolBlue": false, 
  "catPoolDarkBlue": false, 
  "catPoolYellow": false, 
  "catPoolRed": false,
  "catPoolPopcorn1": false,
  "catPoolPopcorn2": false,
  "catPoolPopcorn3": false,
  "catPoolPopcorn4": false
}


function draw(ctx, images) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images['catPoolCloud'], 0, 0);
  requestAnimationFrame(() => draw(ctx, images));
}


const isTrue = (value) => value === true;



function CatPoolAnimation() {
  const canvasRef = useRef();
  

  

  useEffect(() => {

    var images = {
      "catPoolCloud": new Image(), 
      "catPoolBlue": new Image(), 
      "catPoolDarkBlue": new Image(), 
      "catPoolYellow": new Image(), 
      "catPoolRed": new Image(),
      "catPoolPopcorn1": new Image(),
      "catPoolPopcorn2": new Image(),
      "catPoolPopcorn3": new Image(),
      "catPoolPopcorn4": new Image()
    }

    for (const [key, value] of Object.entries(imagesLoaded)) {
      console.log(`Loading ${key}`)
      var image = images[key];
      image.onload = function() {
        console.log(`Loaded image ${key}`);
        imagesLoaded[key] = true;
        if (Object.values(imagesLoaded).every(isTrue)) {
          console.log("All images loaded, begin drawing.")
          requestAnimationFrame(() => draw(ctx, images));
        }
        
      }
      image.src=`/images/${key}.png`;
    }
    
    const ctx = canvasRef.current.getContext("2d");
      //requestAnimationFrame(() => draw(ctx));

      const handleResize = e => {
        ctx.canvas.height = window.innerWidth;
        ctx.canvas.width = window.innerWidth;
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
  }, []);

  console.log("im being rendered");

  return <PureCanvas ref={canvasRef} />;
}

export default CatPoolAnimation;
