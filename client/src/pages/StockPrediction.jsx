import React, { useState, useEffect } from "react";
import { CartesianGrid, LineChart, ComposedChart, Line, XAxis, YAxis, Tooltip, Brush, Legend, ResponsiveContainer } from 'recharts';
import "../styles/StockPredict.css";

const mainDataKeys = ["Samsung", "Apple", "Bitcoin"];
const DataKeys = ["predictSamsung", "predictApple", "predictBitcoin"];

// // 데이터 생성
// function generateSampleData(initialMonths, predictionMonths) {
//   const data = [];
//   let currentDate = new Date(2018, 0, 1);

//   // 초기 데이터 생성
//   for (let i = 0; i < initialMonths; i++) {
//     data.push({
//       x: currentDate.toISOString().split("T")[0],
//       Samsung: Math.floor(Math.random() * 100000) + 20000,
//       Apple: Math.floor(Math.random() * 300000) + 20000,
//       Bitcoin: Math.floor(Math.random() * 100000000) + 20000,
//       predictSamsung: null,
//       predictApple: null,
//       predictBitcoin: null
//     });
//     currentDate.setMonth(currentDate.getMonth() + 1);
//   }

//   if (data.length > 0) {
//     let lastDate = new Date(data[data.length - 1].x);
//     let lastEntry = data[data.length - 1]; // 기존 데이터의 마지막 항목을 저장

//     // 첫 번째 예측 데이터를 기존 데이터의 마지막 항목과 동일하게 설정
//     data.push({
//       x: lastEntry.x,
//       predictSamsung: lastEntry.Samsung,
//       predictApple: lastEntry.Apple,
//       predictBitcoin: lastEntry.Bitcoin,
//     });

//     for (let i = 0; i < predictionMonths; i++) {
//       // 다음 달로 이동한 후, 월말로 설정
//       lastDate.setMonth(lastDate.getMonth() + 1);
//       lastDate.setDate(0); // 다음달 0번째 일 = 현재달 마지막 날

//       data.push({
//         x: lastDate.toISOString().split("T")[0],
//         predictSamsung: Math.floor(Math.random() * 100000) + 20000,
//         predictApple: Math.floor(Math.random() * 300000) + 20000,
//         predictBitcoin: Math.floor(Math.random() * 100000000) + 20000,
//       });
//     }
//   }
//   console.log(data);
//   return data;
// }


// 툴팁= 커서 박스
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="stock-prediction-custom-tooltip">
        <p className="label">{`Date: ${label}`}</p>
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


// 메인함수
function StockPrediction() {

  // const [stockData, setStockData] = useState({});
  // const [predictData, setPredictData] = useState({});
  const [data, setData] = useState([]);
  // 데이터 가지고오기
  useEffect (() => {
    const fetchStockData = async () => {
      console.log("주식데이터fetch시작확인");

      try {
        const request = await fetch(`${process.env.REACT_APP_API_URL}/api/stock-predict/stock-predict`, {
          method: 'GET',
        });
        console.log("주식응답데이터:", request);  // 응답 수신 확인
        
        if (!request.ok) {
          throw new Error('주식정보를 가져오는 중 오류가 발생했습니다.');
        }
        const resData = await request.json();
        console.log("주식데이터:", resData[254]);
        // setStockData(resData.stock_data);
        // setPredictData(resData.predict_data);
        setData(resData);
      } catch (err) {
        console.error("주식데이터 가져오기 비동기통신에러", err);
      } 
    }
    fetchStockData()
  }, []);
  
  // const data = generateSampleData(80, 6);  // 랜덤 데이터 생성
  const totalDataPoints = data.length;  // 포인트 수
  const brushDataPoints = 100; // 화면 초기 차트에 적용되는 포인트 수
  const initialBrushRange = {
    startIndex: totalDataPoints - brushDataPoints,
    endIndex: totalDataPoints - 1,
  };

  const [availableMainDataKeys, setAvailableMainDataKeys] =
    useState(mainDataKeys);
  const [availableDataKeys, setAvailableDataKeys] = useState(DataKeys);
  const [compareMainCompany, setCompareMainCompany] = useState(null);
  const [compareCompany, setCompareCompany] = useState(null);

  const handleAddMainCompany = (main_company) => {
    if (compareMainCompany) {
      setAvailableMainDataKeys((prev) => [...prev, compareMainCompany]);
    }
    setCompareMainCompany(main_company);
    setAvailableMainDataKeys((prev) => prev.filter((c) => c !== main_company));
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

  // 데이터 선 색상 정의
  const getLineColor = (dataKey) => {
    if (dataKey === "Samsung") return "#00FFFF";
    if (dataKey === "Apple") return "#FF0000";
    if (dataKey === "Bitcoin") return "#FFFF00";
    if (dataKey === "predictSamsung") return "green";
    if (dataKey === "predictApple") return "green";
    if (dataKey === "predictBitcoin") return "green";
    return "#FFFFFF";
  };

  return (
    <div>
      <h1 className="stock-prediction-header">Chart of Predict direction</h1>
      
      <div className="stock-prediction-info">
        <div className="stock-prediction-list">
          
          <h3 className="stock-prediction-list-event">종목</h3>
          {mainDataKeys.map((main_company) => (
            <div
              className="main-prediction-company"
              key={main_company}
              style={{ marginBottom: "10px", cursor: "pointer" }}
              onClick={() => handleAddMainCompany(main_company)}
            >
              {main_company}
            </div>
          ))}
          <div className="main-prediction-company-bottom" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="chart-prediction-container">
            <ResponsiveContainer width="98%" height={500}>
            <ComposedChart
              data={data}
              margin={{
                top: 0,
                right: 30,
                left: 30,
                bottom: 0,
              }}
            >
            <XAxis
              dataKey="x"  // x축에 사용할 데이터 키 지정. (날짜)
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;  // "YYYY년 MM월"형식으로 반환
              }}
              stroke="#fff"  // x축의 선색상 지정 (흰색)
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `${value.toLocaleString()}`}
              stroke="#fff"
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {compareMainCompany && (  // 기업 그래프
              <>
                <Line
                  yAxisId="left"
                  type="linear"
                  dataKey={compareMainCompany}
                  stroke={getLineColor(compareMainCompany)}
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="linear"
                  dataKey={`predict${compareMainCompany}`}
                  stroke={getLineColor(`predict${compareMainCompany}`)}
                  strokeWidth={3}
                  dot={false}
                  strokeDasharray="3 3" // 점선으로 예측 부분을 구분
                />
              </>
            )}
            <Brush
              dataKey="x"
              height={15}
              stroke="rgb(255,255,255)"
              fill="rgb(0,0,0)"
              startIndex={initialBrushRange.startIndex}
              endIndex={initialBrushRange.endIndex}
              travellerWidth={10}
              tickFormatter={() => ""}
            />
          </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="stock-prediction-list">
          <div className="stock-prediction-compare">
            <h3 className="stock-prediction-list-event">예측 데이터</h3>
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
                  className="stock-prediction-minus-button"
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
                  className="stock-prediction-minus-button"
                  onClick={handleRemoveCompany}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockPrediction;