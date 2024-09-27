import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../styles/StockChart.css";
import pbr_icon from  '../images/stock_pbr_icon.png';
import per_icon from '../images/stock_per_icon.png';
import roe_icon from '../images/stock_dividend_icon.png'

const mainDataKeys = ["Samsung_KRW", "Apple_USD", "Bitcoin_USD"];

const DataKeys = [
  'GDP_한국',
  'M2_통화공급_말잔_한국',
  'M2_통화공급_평잔_한국',
  '기준금리_한국',
  '생산자물가지수_한국',
  '수입물가지수_한국',
  '소비자물가지수_한국',
  '수입지수_한국',
  '수출지수_한국',
  '경상수지_한국',
  '소비자심리지수_한국',
  '기업경기실사지수_한국',
  '외환보유액_한국',
  'GDP_미국',
  '기준금리_미국',
  '수입물가지수_미국',
  '생산자물가지수_미국',
  '소비자물가지수_전년대비_미국',
  '소비자물가지수_전월대비_미국',
  '무역수지_미국',
  '소비자신뢰지수_미국',
  '개인지출_미국',
  '소매판매_미국',
  '소비자심리지수_미국',
  'NASDAQ',
  'SnP500',
  '다우존스',
  'KOSPI',
  '금',
  '유가',
  '환율',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="stock-custom-tooltip">
        <p className="label">{`Date: ${label.split('T')[0]}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="intro">{`${
            entry.name
          }: ${entry.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

function StockChart() {
  const [stockData, setStockData] = useState([]);
  const [brushStartIndex, setBrushStartIndex] = useState(0);
  const [brushEndIndex, setBrushEndIndex] = useState(0);
  const [perPbrRoe, setPerPbrRoe] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stock-chart/stock`);
        const data = await response.json();
        if (response.ok && data.merged) {
          setStockData(data.merged);
          setBrushEndIndex(data.merged.length - 1);
        } else {
          console.error('Failed to fetch Stock Data : ', data.error || 'No StockData in response');
        }
        if (response.ok && data.per_pbr_roe) {
          setPerPbrRoe(data.per_pbr_roe[0]);
        } else {
          console.error('Failed to fetch PER, PBR, ROE Data : '. data.error || 'No PER, PBR, ROE Data in response');
        }
      } catch (error) {
        console.error('Error fetching Stock data', error);
      }
    };
    fetchData();
  }, []);
  const handleBrushChange = ({ startIndex, endIndex }) => {
    setBrushStartIndex(startIndex);
    setBrushEndIndex(endIndex);
  };

  const [availableMainDataKeys, setAvailableMainDataKeys] = useState(mainDataKeys);
  const [availableDataKeys, setAvailableDataKeys] = useState(DataKeys);
  const [compareMainCompany, setCompareMainCompany] = useState(null);
  const [compareCompany, setCompareCompany] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [filteredDataKeys, setFilteredDataKeys] = useState(DataKeys);
  

  useEffect(() => {
    setFilteredDataKeys(
      availableDataKeys.filter((key) =>
        key.toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [searchInput, availableDataKeys]);

  const handleAddMainCompany = (main_company) => {
    if (compareMainCompany) {
      setAvailableMainDataKeys((prev) => [...prev, compareMainCompany]);
    }
    setCompareMainCompany(main_company);
    setAvailableMainDataKeys((prev) => prev.filter((c) => c !== main_company));
  };

  const handleAddCompany = (company) => {
    if (compareCompany) {
      setAvailableDataKeys((prev) => [...prev, compareCompany]);
    }
    setCompareCompany(company);
    setAvailableDataKeys((prev) => prev.filter((c) => c !== company));
  };

  const handleRemoveMainCompany = () => {
    if (compareMainCompany) {
      setAvailableMainDataKeys((prev) => [...prev, compareMainCompany]);
      setCompareMainCompany(null);
    }
  };

  const handleRemoveCompany = () => {
    if (compareCompany) {
      setAvailableDataKeys((prev) => [...prev, compareCompany]);
      setCompareCompany(null);
    }
  };

  const getLineColor = (dataKey) => {
    if (dataKey === "Samsung_KRW") return "#00FFFF";
    if (dataKey === "Apple_USD") return "#FF0000";
    if (dataKey === "Bitcoin_USD") return "#FFFF00";
    return "#FFFFFF";
  };

  const getMinValue = (dataKey) => {
    return Math.min(...stockData.map(item => item[dataKey] || Infinity));
  };

  const minMainCompanyValue = compareMainCompany ? getMinValue(compareMainCompany) : 0;
  const minCompanyValue = compareCompany ? getMinValue(compareCompany) : 0;
  const minValue = Math.min(minMainCompanyValue, minCompanyValue);

  return (
    <div>
      <h1 className="stock-header">Chart Comparison</h1>
      <div className="stock-info">
        <div className="stock-list">
          <h3 className="stock-list-event">종목</h3>
          {mainDataKeys.map((main_company) => (
            <div
              className="main-company"
              key={main_company}
              style={{ marginBottom: "10px", cursor: "pointer" }}
              onClick={() => handleAddMainCompany(main_company)}
            >
              {main_company}
            </div>
          ))}
          <div className="main-company-bottom" />
          <h3 className="stock-comparison">비교 지표</h3>
          <input
            className="sub-company-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
          />
          <div className="sub-company">
            {filteredDataKeys.map((company) => (
              <div
                className="sub-company-list"
                key={company}
                style={{ marginBottom: "10px", cursor: "pointer" }}
                onClick={() => handleAddCompany(company)}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="chart-container">
            <ResponsiveContainer width="90%" height={550}>
              <ComposedChart
                data={stockData}
                margin={{
                  top: 0,
                  right: 30,
                  left: 30,
                  bottom: 10,
                }}
              >
                <XAxis
                  dataKey="x"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                  }}
                  stroke="#fff"
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                  stroke="#fff"
                  tickCount={5}
                  domain={[minValue, 'auto']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                  stroke="#fff"
                  tickCount={5}
                  width={80}
                  domain={[minValue, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  height={20} 
                />
                {compareMainCompany && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey={compareMainCompany}
                    stroke={getLineColor(compareMainCompany)}
                    strokeWidth={3}
                    dot={false}
                  />
                )}
                {compareCompany && (
                  <Line
                    yAxisId="right"
                    type="linear"
                    dataKey={compareCompany}
                    stroke={getLineColor(compareCompany)}
                    strokeWidth={3}
                    dot={false}
                  />
                )}
                <Brush
                  dataKey="x"
                  height={15}
                  stroke="rgb(255,255,255)"
                  fill="rgb(0,0,0)"
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                  travellerWidth={10}
                  tickFormatter={() => ""}
                  onChange={handleBrushChange}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="stock-list">
          <div className="stock-compare">
            <h3 className="stock-list-event">비교 데이터</h3>
            {compareMainCompany && (
              <div
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {compareMainCompany}
                <button
                  className="stock-minus-button"
                  onClick={handleRemoveMainCompany}
                >
                  ×
                </button>
              </div>
            )}
            {compareCompany && (
              <div
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {compareCompany}
                <button
                  className="stock-minus-button"
                  onClick={handleRemoveCompany}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {compareMainCompany === 'Samsung_KRW' && perPbrRoe && (
        <div className="stock-per-pbr">
          <img src={per_icon} /><p>PER : </p><p>{perPbrRoe['sc_ss_per']}</p>
          <img src={pbr_icon}/><p>PBR : </p><p>{perPbrRoe['sc_ss_pbr']}</p>
          <img src={roe_icon}/><p>ROE : </p><p>{perPbrRoe['sc_ss_roe']}</p>
        </div>
      )}
      {compareMainCompany === 'Apple_USD' && perPbrRoe && (
        <div className="stock-per-pbr">
          <img src={per_icon} /><p>PER : </p><p>{perPbrRoe['sc_ap_per']}</p>
          <img src={pbr_icon}/><p>PBR : </p><p>{perPbrRoe['sc_ap_pbr']}</p>
          <img src={roe_icon}/><p>ROE : </p><p>{perPbrRoe['sc_ap_roe']}</p>
        </div>
      )}
      {compareMainCompany === 'Bitcoin_USD' && perPbrRoe && (
        <div className="stock-per-pbr" /> // 이 부분은 불필요하므로 삭제하거나 조건을 추가하세요.
      )}
    </div>
  );
}

export default StockChart;