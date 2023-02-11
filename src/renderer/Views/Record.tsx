import { Ref, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useInterval } from '../../../utils/CustomHooks/useInterval';
import './statics/record.css';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import CustomBackButton from './components/CustomBackButton';
import { ForwardedRef } from 'react-chartjs-2/dist/types';
import { ipcRenderer } from 'electron';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  zoomPlugin
);

interface valueList {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}
interface plotList {
  labels: string[];
  datasets: valueList[];
}

interface csvData {
  date: number[];
  value: number[];
}

export const options = {
  responsive: true,
  plugins: {
    zoom: {
      pan: {
        enabled: true,
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
      },
    },
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Live Streaming EMG-Graph',
    },
  },
};
function Record() {
  const [filePath, setFilePath] = useState<string[] | string>('');
  // const [csvData, setCsvData] = useState<csvData[]>([]);
  // const [stopFlag, setStopFlag] = useState<boolean>(true);
  const chartRef = useRef<ChartJS | null>(null);
  const [plotList, setPlotList] = useState<plotList>({
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });
  const [fileName, setFileName] = useState<string>('');
  const [fileNameError, setFileNameError] = useState<string>('');
  const [stopFlag, setStopFlag] = useState<boolean>(true);

  const handleChange = (chartRef: any) => {
    if (!stopFlag) {
      let currentDate = Date.now();
      let mathRandomInt = Math.random();

      //async data here
      chartRef.data.labels.push(currentDate);
      chartRef.data.datasets[0].data.push(mathRandomInt);
      // console.log([...csvData, [currentDate, mathRandomInt]]);
      // setCsvData(csvData.push({ data: currentDate, value: mathRandomInt }));
      chartRef.update();
    }
  };

  const handleStop = () => {
    setStopFlag(true);
  };

  const handleInputChange = (e: HTMLInputElement) => {
    setFileName(e.value);
  };

  const arrayBuffer: csvData[] = [];

  useInterval(() => {
    handleChange(chartRef.current);
  }, 2000);

  useEffect(() => {
    return () => {};
  }, []);
  return (
    <div className="record-root">
      <div className="record-controls">
        <div className="record-back-button">
          <Link to="/">
            <CustomBackButton />
          </Link>
        </div>
        <div className="record-title">The Graph is Listening for Input</div>
        <div className="record-controls-options">
          <div className="record-textbox-area">
            <input
              placeholder="Enter File Name"
              type="text"
              value={fileName}
              onChange={(e) => {
                handleInputChange(e.target);
              }}
              className="record-fileName"
            />

            <span className="record-input-error">{fileNameError}</span>
          </div>
          <button
            className="record-media-button record-start-button"
            onClick={() => {
              setStopFlag(false);
              // setStopFlag(false);
            }}
          >
            <div className="record-start-button-object"></div>
          </button>
          <button
            className="record-media-button record-stop-button"
            onClick={handleStop}
          >
            <div className="record-stop-button-object"></div>
          </button>
          <button
            onClick={() => {
              if (fileName != '') {
                window.electron.sendSaveData([
                  chartRef.current?.data.labels,
                  chartRef.current?.data.datasets[0].data,
                  fileName,
                ]);
              } else {
                setFileNameError('Invalid: File Name not Set');
              }
              handleStop();
            }}
            className="record-save-button"
          >
            Save
          </button>
        </div>
      </div>
      {/* {console.log(csvData)} */}
      <div id="plotly-container">
        <Chart
          ref={chartRef}
          type="line"
          width={750}
          height={500}
          options={options}
          data={plotList}
        />
      </div>
    </div>
  );
}

export default function App() {
  return <Record />;
}
