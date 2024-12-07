// @ts-nocheck
import React from "react";
import Grid from "@mui/material/Grid2";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import "./App.css";
import pierroDella from "./images/pierro_della.jpg";

function App() {
  // Store state of whether cv is loaded
  const [cvLoaded, setCVLoaded] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({
    width: 0,
    height: 0,
  });

  // Handle event for open cv being loaded
  React.useEffect(() => {
    const handleOpenCVLoaded = (event: any) => {
      setCVLoaded(event.detail.cvLoaded);
    };

    window.addEventListener("open-cv-loaded", handleOpenCVLoaded);

    return () => {
      window.removeEventListener("open-cv-loaded", handleOpenCVLoaded);
    };
  }, []);

  // Create Canvas size based on image size
  const onImageLoad = ({ target: image }: { target: any }) => {
    console.log("Image Dimensions", {
      width: image.offsetWidth,
      height: image.offsetHeight,
    });

    setImageDimensions({
      width: image.offsetWidth,
      height: image.offsetHeight,
    });
  };

  const generateImage = () => {
    const cv2 = cv;
    const srcPts = new cv2.matFromArray(4, 2, cv.CV_32FC1, [
      rect.x, rect.y,
      rect.x+rect.width, rect.y,
      rect.x, rect.y+rect.height,
      rect.x+rect.width, rect.y+rect.height,
    ]);
    const destPts = new cv2.matFromArray(4, 2, cv.CV_32FC1, [
      0, 0,
      canvasRef.current.width, 0,
      0, canvasRef.current.height,
      canvasRef.current.width, canvasRef.current.height,
    ]);
    console.log("Src Pts", srcPts);
    console.log("Dest Pts", destPts);
    const homogM = cv2.getPerspectiveTransform(srcPts, destPts);
    console.log("Homography", homogM);
  };

  /* START REACT CANVAS DRAWING CODE HERE */
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [startPoint, setStartPoint] = React.useState({ x: 0, y: 0 });
  const [rect, setRect] = React.useState({ x: 0, y: 0, width: 0, height: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.strokeStyle = "black";
      context.lineWidth = 3;
    }
  }, [canvasRef.current]);

  const handleMouseDown = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const rectRef = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rectRef.left;
    const y = e.clientY - rectRef.top;
    setStartPoint({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rectRef = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rectRef.left;
    const y = e.clientY - rectRef.top;

    setRect({
      x: Math.min(x, startPoint.x),
      y: Math.min(y, startPoint.y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    });

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.strokeRect(
      Math.min(x, startPoint.x),
      Math.min(y, startPoint.y),
      Math.abs(x - startPoint.x),
      Math.abs(y - startPoint.y)
    );
  };

  const stopDrawingRectangle = () => {
    setIsDrawing(false);
    setStartPoint({ x: 0, y: 0 });
  };

  /* END REACT CANVAS DRAWING CODE HERE */

  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Homography Projection
          </Typography>
        </Toolbar>
      </AppBar>
      {!cvLoaded ? (
        <Grid container style={{ width: "100%", height: "92%" }}>
          <Grid
            size={12}
            alignItems="center"
            justifyContent="center"
            display="flex"
          >
            <CircularProgress />
          </Grid>
        </Grid>
      ) : (
        <Grid container style={{ width: "100%", height: "90%" }}>
          <Grid
            size={6}
            style={{
              maxHeight: "80%",
              maxWidth: "100%",
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "2%",
            }}
          >
            <img
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                ponterEvents: "none",
                zIndex: 1,
              }}
              src={pierroDella}
              onLoad={onImageLoad}
              onDragStart={() => {}}
            />
            <canvas
              style={{
                position: "absolute",
                zIndex: 2,
              }}
              height={imageDimensions.height}
              width={imageDimensions.width}
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawingRectangle}
              onMouseLeave={stopDrawingRectangle}
            />
          </Grid>
          <Grid
            size={6}
            style={{
              maxHeight: "80%",
              maxWidth: "100%",
            }}
          ></Grid>
          <Grid size={12}>
            <Button onClick={generateImage}>Generate</Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default App;
