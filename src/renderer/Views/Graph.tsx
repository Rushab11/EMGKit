import { useEffect, useState } from 'react';
import './statics/graph.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import CustomSwitch from './components/CustomSwitch';
import { Link } from 'react-router-dom';
import CustomBackButton from './components/CustomBackButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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
      text: 'EMG-Graph',
    },
  },
};

function Graph() {
  const [filePath, setFilePath] = useState<string[] | string>('');

  const [plotList, setPlotList] = useState<plotList>({
    labels: [''],
    datasets: [
      {
        label: '',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });
  // const

  const handleOpenFile = async () => {
    const fileData: string[][] = await window.dialog.openFile();
    if (fileData) {
      setFilePath(fileData[0]);
      const tempList: plotList = {
        labels: [''],
        datasets: [
          {
            label: 'current',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      };
      let plottingData: string[] = fileData[1];
      // let tempDate = new Date(0);
      // let startTime = plottingData[0][0];
      for (let i = 0; i < plottingData.length; i++) {
        // let tempDate = new Date(0);
        // tempDate.setUTCMilliseconds(plottingData[i][0]);
        tempList.labels.push(plottingData[i][0]);
        tempList.datasets[0].data.push(parseInt(plottingData[i][1]));
      }
      setPlotList(tempList);
    }
  };

  const handleFilterSwitch = (condition: boolean) => {};

  return (
    <div className="graph-root">
      <div className="graph-controls">
        <div className="graph-back-button">
          <Link to="/">
            <CustomBackButton />
          </Link>
        </div>
        <div className="graph-controls-upload">
          <input
            type="text"
            value={filePath}
            readOnly={true}
            className="graph-filepath"
          />
          <button
            onClick={handleOpenFile}
            type="button"
            id="file-btn"
            className="graph-file-button"
          >
            Select a File
          </button>
        </div>
        <div className="graph-controls-options">
          <CustomSwitch switchLabel="Filter" onFunc={handleFilterSwitch} />
          {/* <CustomSwitch switchLabel="Animate" onFunc={() => {}} /> */}
        </div>
      </div>
      <div id="plotly-container">
        <Line width={750} height={500} options={options} data={plotList} />
      </div>
    </div>
  );
}

export default function App() {
  return <Graph />;
}
