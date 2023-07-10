import { memo } from "react";
import styles from "./Control.module.css";

const ControlBar = ({
  refControl,
  handlePlay,
  handlePause,
  handleChange,
  value,
  disableBtn,
}) => {
  return (
    <div id="control-bar" className={styles.controlBar}>
      <div id="title" className={styles.title}>
        <p id="helper-text">Movies watched from </p>
      </div>
      <div id="scrubber">
        <input
          className={styles.scrubberInput}
          ref={refControl}
          id="scrubberInput"
          type="range"
          min="0"
          max="100"
          defaultValue={value}
          onChange={handleChange}
        />
        <div id="subtitle">
          <p id="helper-subtext" className={styles.helperSubtext}>
            Move the slider to change the date range.
          </p>
        </div>
        <div className={styles.btnRow}>
          <button
            onClick={handlePlay}
            className={
              !disableBtn ? `${styles.btn} ${styles.btnDisabled}` : styles.btn
            }
            disabled={!disableBtn}
          >
            Play
          </button>
          <button onClick={handlePause} className={styles.btn}>
            Pause
          </button>
        </div>
      </div>
    </div>
  );
};
export default memo(ControlBar);
