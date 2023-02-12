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
import { EMGFilter } from '../../../utils/EMGFilter/EMGFilters';
import {
  NOTCH_FREQUENCY,
  SAMPLE_FREQUENCY,
} from '../../../utils/EMGFilter/constants';

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
  const [filter, setFilter] = useState<boolean>(false);
  const [fileReadStream, setFileReadStream] = useState<string[][][]>([[[]]]);
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
  const graphPlotter = (plotPoints: string[][]): plotList => {
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
    let plottingData: string[][] = plotPoints;
    // let tempDate = new Date(0);
    // let startTime = plottingData[0][0];
    for (let i = 0; i < plottingData.length; i++) {
      // let tempDate = new Date(0);
      // tempDate.setUTCMilliseconds(plottingData[i][0]);
      tempList.labels.push(plottingData[i][0]);
      tempList.datasets[0].data.push(parseInt(plottingData[i][1]));
    }
    return tempList;
    // setPlotList(tempList);
  };
  const applyFilter = (plotPoints: string[][][]): string[][][] => {
    let filteredData: string[][] = [[]];
    const tempFilterData: string[][] = [...plotPoints[1]];
    for (var i = 0; i < tempFilterData.length; i++) {
      let output: number = EMGFilter(
        SAMPLE_FREQUENCY.FREQ_500HZ,
        NOTCH_FREQUENCY.FREQ_50HZ,
        true,
        true,
        true,
        parseInt(tempFilterData[i][1])
      );
      filteredData = [...tempFilterData];
      filteredData[i].pop();
      filteredData[i].push(output.toString());
    }
    return [plotPoints[0], filteredData];
  };

  const handleOpenFile = async () => {
    let fileData: string[][][] = await window.dialog.openFile();
    setFileReadStream(fileData);
    if (fileData) {
      setFilePath(fileData[0][0]);
      if (filter) {
        fileData = applyFilter(fileData);
      }
      const finalData: plotList = graphPlotter(fileData[1]);
      setPlotList(finalData);
    }
  };

  const handleFilterSwitch = (condition: boolean) => {
    if (fileReadStream.length > 0) {
      if (condition) {
        console.log(fileReadStream);
        let fileData: string[][][];
        const p = JSON.stringify(fileReadStream);
        fileData = applyFilter(JSON.parse(p));
        const temp: plotList = graphPlotter(fileData[1]);
        setPlotList(temp);
      } else {
        let fileData: string[][][];
        const p = JSON.stringify(fileReadStream);
        const temp: plotList = graphPlotter(JSON.parse(p)[1]);
        setPlotList(temp);
      }
    }
    setFilter(condition);
  };

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
          <CustomSwitch
            initialState={filter}
            switchLabel="Filter"
            onFunc={handleFilterSwitch}
          />
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
