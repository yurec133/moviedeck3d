import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import DeckGL from "@deck.gl/react";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl";
import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ELEVATION_SCALE,
  RADIUS,
  ELEVATION_RANGE,
  ITERS,
} from "./consts/constants.js";
import { fetchCSV } from "./utils/fetchCSV.js";
import { getTooltip } from "./utils/getTooltip.js";
import {
  COLOR_RANGE,
  INITIAL_VIEW_STATE,
  MAP_STYLE,
  MATERIAL,
} from "./consts/layers.js";
import ControlBar from "./components/controlBar/ControlBar.jsx";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});
const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-74.006972, 40.713783, 1000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-73.999425, 40.704128, 1000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

function App() {
  const [counter, setCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataCSV, setDataCSV] = useState([]);
  const [play, setPlay] = useState(true);
  const isIterateEnd = counter === ITERS;
  const refSlider = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await fetchCSV();
      setDataCSV(data);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!dataCSV.length || play) return;
    const interval = iterateData(dataCSV, updateData);
    return () => clearTimeout(interval);
  }, [dataCSV, counter, play]);

  const layers = new HexagonLayer({
    id: "heatmap",
    // colorRange: "#0a84ff",
    colorRange: COLOR_RANGE,
    color: "#0a84ff",
    coverage: 1,
    data,
    elevationRange: [0, ELEVATION_RANGE],
    elevationScale: ELEVATION_SCALE,
    extruded: true,
    getPosition: (d) => d,
    pickable: true,
    radius: RADIUS,
    upperPercentile: 100,
    material: MATERIAL,
    transitions: {
      getElevationValue: {
        duration: 2000,
        easing: d3.easeQuadOut,
      },
    },
  });

  function updateData(data) {
    if (!data.length) return;
    const dateRange = [data[0].date, data[data.length - 1].date];
    d3.select("#helper-text").text(
      `Movies watched from ${d3.timeFormat("%b %d, %H:%M:%S")(
        dateRange[0]
      )} to ${d3.timeFormat("%b %d, %H:%M:%S")(dateRange[1])}`
    );
    d3.select("#helper-subtext").text(
      `Move the slider to change the date range.`
    );
    const arrPosition = data.map((d) => [d.longitude, d.latitude]);
    setData(arrPosition);
  }

  function iterateData(dataRaw, updateData) {
    const overallDataRange = [
      dataRaw[0].date,
      dataRaw[dataRaw.length - 1].date,
    ];
    const totalRangeInterval = overallDataRange[1] - overallDataRange[0];
    const iterationInterval = Math.ceil(totalRangeInterval / ITERS);
    const interval = setTimeout(() => {
      if (counter < ITERS) {
        const fromDate = new Date(
          overallDataRange[0].getTime() + counter * iterationInterval
        );
        const toDate = new Date(
          overallDataRange[0].getTime() + (counter + 1) * iterationInterval
        );
        // console.log("from date is ", fromDate, toDate);
        const filtered = dataRaw.filter((d) => {
          //filter by date property of each element
          return d.date >= fromDate && d.date <= toDate;
        });
        //set the scrubber input value to the current iteration
        refSlider.current.value = counter / (ITERS / 100);
        updateData(filtered);
        setCounter((prevCounter) => prevCounter + 1);
      } else {
        clearTimeout(interval);
      }
    }, 800);
    return interval;
  }

  const handlePlay = useCallback(() => {
    if (isIterateEnd) {
      setCounter(0);
    }
    setPlay(false);
  }, [isIterateEnd]);

  const handlePause = useCallback(() => {
    setPlay(true);
  }, []);

  const handleChange = useCallback((e) => {
    setCounter(Number(e.target.value));
  }, []);


  if (isLoading) {
    return <div className={"loading"}>Loading...</div>;
  }
  return (
    <>
      <DeckGL
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={MAP_STYLE}
          preventStyleDiffing={true}
        />
      </DeckGL>
      <ControlBar
        disableBtn={play || isIterateEnd}
        refControl={refSlider}
        handlePause={handlePause}
        handlePlay={handlePlay}
        handleChange={handleChange}
        value={counter}
      />
    </>
  );
}

export default App;
