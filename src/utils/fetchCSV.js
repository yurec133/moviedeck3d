import * as d3 from "d3";
import { DATA_URL } from "../consts/constants.js";

export function fetchCSV() {
  const data = d3
    .csv(DATA_URL)
    .then((response) => {
      const dataRaw = [];
      if (!response.length) return
      for (let i = 0; i < response.length; i++) {
        const d = response[i];

        const daysAdded = +d.dow;

        //add the days to the date and then add the time
        const date = new Date("2023-05-04");
        date.setDate(date.getDate() + daysAdded);

        const time = d3.timeParse("%H:%M:%S")(d.time_utc);
        if(time){
          date.setHours(time.getHours());
          date.setMinutes(time.getMinutes());
          date.setSeconds(time.getSeconds());
        }
        dataRaw.push({
          date: date,
          latitude: +d.latitude,
          longitude: +d.longitude,
        });
      }
      return dataRaw;
    })
    .catch((error) => {
      console.log("error is fetchData", error);
    });
  return data;
}
