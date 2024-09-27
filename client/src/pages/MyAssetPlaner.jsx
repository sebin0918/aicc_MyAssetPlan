import React, { useEffect, useState } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import "../styles/myAssetPlaner.css";
import householdButtonIcon from '../images/map_household_button_icon.png';
import samsungIcon from '../images/samsung_icon.png';
import appleIcon from '../images/apple_icon.png';
import bitcoinIcon from '../images/bitcoin_icon.png';
import totalIncomIcon from '../images/map_total_income_icon.png';
import returnEquityIcon from '../images/map_return_equity_icon.png';
import { Link } from "react-router-dom";

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  // 선의 길이와 꺾이는 각도를 조정하여 좀 더 가까운 위치에 배치
  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 14) * cos; // 길이를 줄임
  const my = cy + (outerRadius + 14) * sin;
  
  // 선의 꺾이는 부분도 좀 더 가까운 거리로 설정
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my + (sin >= 0 ? 1 : -1) * 8;

  // 텍스트를 선 끝에서 적절한 거리로 배치
  const textAnchor = cos >= 0 ? 'start' : 'end';
  
  // 천 단위로 쉼표를 넣어 숫자 형식 변환
  const formattedValue = value.toLocaleString();

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="white" fontWeight="bold">{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      {/* 선을 완만하게 꺾음 */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />

      {/* 텍스트를 꺾인 선의 끝에 배치 */}
      <text x={ex + (cos >= 0 ? 10 : -10)} y={ey} textAnchor={textAnchor} fill="#ffffff">
        {`${formattedValue} 원`}
      </text>
      <text x={ex + (cos >= 0 ? 10 : -10)} y={ey + 15} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const MyAssetPlaner = () => {
  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [totalAssetData, setTotalAssetData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentMonthReceived, setCurrentMonthReceived] = useState(0);

  const [deposit, setDeposit] = useState(0);
  const [installmentSaving, setInstallmentSaving] = useState(0);
  const [userLoan, setUserLoan] = useState(0);
  const [samsungStock, setSamsungStock] = useState({});
  const [appleStock, setAppleStock] = useState({});
  const [coin, setCoin] = useState({});
  const [total, setTotal] = useState({});
  const [currentBudget, setCurrentBudget] = useState("0");
  const [lastMonthExpenditure, setLastMonthExpenditure] = useState(0);
  const [currentMonthExpenditure, setCurrentMonthExpenditure] = useState(0);

  const [data1, setData1] = useState([
    { name: '전월 지출', value: 0 },
    { name: '목표 예산', value: 0 }
  ]);

  const [data2, setData2] = useState([
    { name: '금월 지출', value: 0 },
    { name: '목표 예산', value: 0 }
  ]);

  const [hasBankAccount, setHasBankAccount] = useState(null);

  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [editedDeposit, setEditedDeposit] = useState(deposit);
  const [editedInstallmentSaving, setEditedInstallmentSaving] = useState(installmentSaving);

  const [isEditingLoan, setIsEditingLoan] = useState(false);
  const [editedLoan, setEditedLoan] = useState(userLoan);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchTotalAssetData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/my-asset-planer/total-asset`
        , { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        console.log('Fetched total asset data:', data);
        setTotalAssetData(data);
      } else {
        console.error('Failed to fetch total asset data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching total asset data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchCurrentMonthReceived = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/current-month-received`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        console.log('Fetched current month received:', data);
        setCurrentMonthReceived(parseFloat(data.currentMonthReceived) || 0);
      } else {
        console.error('Failed to fetch current month received:', data.error);
      }
    } catch (error) {
      console.error('Error fetching current month received:', error);
    }
  };

  const fetchData = async (url, setState) => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        console.log(`Fetched data from ${url}:`, data);
        setState(data);
      } else {
        console.error(`Failed to fetch data from ${url}:`, data.error || 'No data in response');
      }
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const fetchMonthlyExpenditures = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/monthly-expenditures`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        console.log('Fetched monthly expenditures:', data);
        setLastMonthExpenditure(parseFloat(data.lastMonthExpenditure) || 0);
        setCurrentMonthExpenditure(parseFloat(data.currentMonthExpenditure) || 0);

        setData1([
          { name: '전월 지출', value: parseFloat(data.lastMonthExpenditure) || 0 },
          { name: '목표 예산', value: parseFloat(currentBudget.replace(/,/g, '')) }
        ]);

        setData2([
          { name: '금월 지출', value: parseFloat(data.currentMonthExpenditure) || 0 },
          { name: '목표 예산', value: parseFloat(currentBudget.replace(/,/g, '')) }
        ]);
      } else {
        console.error('Failed to fetch monthly expenditures:', data.error);
      }
    } catch (error) {
      console.error('Error fetching monthly expenditures:', error);
    }
  };

  useEffect(() => {
    fetchMonthlyExpenditures();
    fetchCurrentMonthReceived();
  }, [currentBudget]);

  useEffect(() => {
    const checkBankAccount = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/check-bank-account`, { credentials: 'include' });
        const data = await response.json();
        setHasBankAccount(data.hasBankAccount);
        if (!data.hasBankAccount) {
          alert('계좌정보가 없습니다. 마이페이지에서 계좌정보를 등록해주세요.');
        }
      } catch (error) {
        console.error('Error checking bank account:', error);
      }
    };

    checkBankAccount(); 
  }, []);

  useEffect(() => {
    if (hasBankAccount === true) {
      fetchData(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/deposit`, (data) => setDeposit(parseFloat(data.userDeposit) || 0));
      fetchData(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/installmentsaving`, (data) => setInstallmentSaving(parseFloat(data.userInstallmentSaving) || 0));
      fetchData(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/loan`, (data) => setUserLoan(parseFloat(data.userLoan) || 0));
      fetchData(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/stock`, (data) => {
        setSamsungStock(data.samsung || {});
        setAppleStock(data.apple || {});
        setCoin(data.coin || {});
        setTotal(data.total || {});
      });
      fetchData(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/target`, (data) => setCurrentBudget(data.targetBudget ? data.targetBudget.toLocaleString() : "0"));
      fetchTotalAssetData();
    }
  }, [hasBankAccount]);  

  const updateTargetBudget = async (newBudget) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/target`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetBudget: newBudget }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentBudget(newBudget.toLocaleString());
      } else {
        console.error('Failed to update target budget:', data.error);
      }
    } catch (error) {
      console.error('Error updating target budget:', error);
    }
  };

  const formatValue = (value) => value !== undefined && value !== null ? value.toLocaleString() : '0';

  const onPieEnter1 = (data, index) => setActiveIndex1(index);
  const onPieEnter2 = (data, index) => setActiveIndex2(index);

  const handleBudgetChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setBudget(value);
    }
  };

  const handleSaveBudget = () => {
    if (budget) {
      updateTargetBudget(parseInt(budget, 10))
        .then(() => {
          setCurrentBudget(budget);
          setBudget("");
          setIsEditing(false);
          alert("예산이 성공적으로 변경되었습니다!"); 
        })
        .catch((error) => {
          console.error("Failed to update budget on server:", error);
          alert("서버에 예산을 업데이트하는 데 문제가 발생했습니다.");
        });
    } else {
      alert("예산 금액을 입력해주세요.");
    }
  };
  
  const handleCancelEdit = () => {
    setBudget("");
    setIsEditing(false);
  };

  const handleDepositChange = (e) => {
    const value = e.target.value;
  
    // 숫자 외의 값 입력 방지
    if (isNaN(value) || value.includes('.') || value.includes('-')) {
      alert("숫자만 입력 가능합니다.");
      return;
    }
  
    setEditedDeposit(value);
  };
  
  const handleInstallmentSavingChange = (e) => {
    const value = e.target.value;
  
    // 숫자 외의 값 입력 방지
    if (isNaN(value) || value.includes('.') || value.includes('-')) {
      alert("숫자만 입력 가능합니다.");
      return;
    }
  
    setEditedInstallmentSaving(value);
  };
  
  const handleLoanChange = (e) => {
    const value = e.target.value;
  
    // 숫자 외의 값 입력 방지
    if (isNaN(value) || value.includes('.') || value.includes('-')) {
      alert("숫자만 입력 가능합니다.");
      return;
    }
  
    setEditedLoan(value);
  };  

  const updateSavings = async () => {
    // 값이 숫자로 변환 가능한지 확인하고 변환
    const depositValue = Number(editedDeposit);
    const savingValue = Number(editedInstallmentSaving);

    if (isNaN(depositValue) || depositValue < 0) {
      alert('정기 예금 값이 올바르지 않습니다. 숫자로 입력해주세요.');
      return;
    }

    if (isNaN(savingValue) || savingValue < 0) {
      alert('적금 값이 올바르지 않습니다. 숫자로 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/deposit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ deposit: depositValue, installmentSaving: savingValue }),
      });
      const data = await response.json();
      if (response.ok) {
        setDeposit(depositValue);
        setInstallmentSaving(savingValue);
        alert('예적금이 성공적으로 업데이트되었습니다.');
        fetchTotalAssetData(); // 자산 정보를 다시 가져오기
      } else {
        console.error('Failed to update savings:', data.error);
      }
    } catch (error) {
      console.error('Error updating savings:', error);
    }
  };

  const updateLoan = async () => {
    const loanValue = Number(editedLoan);

    if (isNaN(loanValue) || loanValue < 0) {
      alert('대출 금액이 올바르지 않습니다. 숫자로 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/loan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ loan: loanValue }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserLoan(loanValue);
        alert('대출 금액이 성공적으로 업데이트되었습니다.');
        fetchTotalAssetData(); // 자산 정보를 다시 가져오기
      } else {
        console.error('Failed to update loan:', data.error);
      }
    } catch (error) {
      console.error('Error updating loan:', error);
    }
  };

  const handleSaveSavings = () => {
    updateSavings();
    setIsEditingSavings(false);
  };

  const handleEditSavings = () => {
    setIsEditingSavings(true);
    setEditedDeposit(deposit);
    setEditedInstallmentSaving(installmentSaving);
  };

  const handleSaveLoan = () => {
    updateLoan();
    setIsEditingLoan(false);
  };

  const handleEditLoan = () => {
    setIsEditingLoan(true);
    setEditedLoan(userLoan);
  };

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // 두 자리수로 변환
    const day = (`0${date.getDate()}`).slice(-2); // 두 자리수로 변환
    return `${year}-${month}-${day}`;
  };

  // invest add 모달 추가 
  const Modal = ({ isOpen, onClose }) => {
    const [investList, setInvestList] = useState([
      { date: "", stock: "", action: "", quantity: "" },
    ]);
    const [existingInvestments, setExistingInvestments] = useState([]);
  
    useEffect(() => {
      // 기존 투자 내역을 서버로부터 가져오는 함수
      const fetchInvestments = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/get-investments`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // 세션 쿠키 포함
          });
          const data = await response.json();
          if (response.ok) {
            setExistingInvestments(data);
          } else {
            console.error("Failed to fetch investment data");
          }
        } catch (error) {
          console.error("Error fetching investment data:", error);
        }
      };
  
      fetchInvestments();
    }, []);
  
    const handleAddRow = () => {
      setInvestList([
        ...investList,
        { date: "", stock: "", action: "", quantity: "" },
      ]);
    };
  
    const handleRemoveRow = (index) => {
      const newInvestList = investList.filter((_, i) => i !== index);
      setInvestList(newInvestList);
    };
  
    const handleInputChange = (index, field, value) => {
      const newInvestList = [...investList];
      newInvestList[index][field] = value;
      setInvestList(newInvestList);
    };
  
    const handleSave = async () => {
      // 데이터 유효성 검사
      for (const item of investList) {
        if (!item.date || !item.stock || !item.action || !item.quantity) {
          alert("모든 필드를 입력해주세요.");
          return;
        }
        if (isNaN(item.quantity)) {
          alert("수량은 숫자만 입력해야 합니다.");
          return;
        }
      }
    
      // 서버에 데이터 전송
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/save-investments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 세션 쿠키 포함
          body: JSON.stringify(investList),
        });
    
        const data = await response.json();
        if (response.ok) {
          alert("투자 정보가 성공적으로 저장되었습니다!");
          onClose(); // 모달 닫기
          fetchData(`${process.env.REACT_APP_API_URL}/api/my-asset-planer/stock`, (data) => {
            setSamsungStock(data.samsung || {});
            setAppleStock(data.apple || {});
            setCoin(data.coin || {});
            setTotal(data.total || {});
          });

          // 자산 정보도 새로고침
          fetchTotalAssetData();  // 여기서 총 자산 정보를 다시 불러옵니다.
        } else {
          // 판매 관련 에러 처리
          if (data.error === "Insufficient stock to sell") {
            alert("매도할 수량이 보유 수량을 초과합니다.");
            setInvestList([{ date: "", stock: "", action: "", quantity: "" }]); // 입력 내용 초기화
          } else {
            alert("저장에 실패했습니다.");
          }
        }
      } catch (error) {
        console.error("Error saving data:", error);
        alert("서버 오류가 발생했습니다.");
      }
    };
    
  
    if (!isOpen) return null;
  
    return (
      <div className="invest-modal-overlay">
        <div className="invest-modal-content">
          <div className="invest-modal-header">
            <h2>내 투자 기록</h2>
            <h2>투자 정보 입력</h2>
          </div>
          <div className="invest-modal-body">
            {/* 좌측: 기존 투자 내역 테이블 */}
            <div className="existing-investments">
              <table>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>삼성전자</th>
                    <th>애플</th>
                    <th>비트코인</th>
                  </tr>
                </thead>
                <tbody>
                  {existingInvestments.map((investment, index) => (
                    <tr key={index}>
                      <td>{formatDate(investment.sh_date)}</td>
                      <td>{investment.sh_ss_count}</td>
                      <td>{investment.sh_ap_count}</td>
                      <td>{investment.sh_bit_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            {/* 우측: 투자 추가 양식 */}
            <div className="add-invest-form">
              {investList.map((item, index) => (
                <div key={index} className="invest-row">
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => handleInputChange(index, "date", e.target.value)}
                  />
                  <select
                    value={item.stock}
                    onChange={(e) => handleInputChange(index, "stock", e.target.value)}
                  >
                    <option value="">종목</option>
                    <option value="Samsung">삼성전자</option>
                    <option value="Apple">애플</option>
                    <option value="Bitcoin">비트코인</option>
                  </select>
                  <select
                    value={item.action}
                    onChange={(e) => handleInputChange(index, "action", e.target.value)}
                  >
                    <option value="">매수 / 매도</option>
                    <option value="buy">매수</option>
                    <option value="sell">매도</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                    placeholder="수량 작성"
                  />
                  <button className="invest-remove-row-btn" onClick={() => handleRemoveRow(index)}>×</button>
                </div>
              ))}
              <div className="add-row-container">
                <button className="invest-add-row-btn" onClick={handleAddRow}>+</button>
              </div>
            </div>
          </div>
          <div className="invest-modal-footer">
            <button className="invest-save-btn" onClick={handleSave}>Save</button>
            <button className="invest-close-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="myassetplaner-dashboard">
      <section className="myassetplaner-summary">
        <div className="total-assets-box">
          <div className="total-assets">
          <h2>총 자산</h2>
              <button className="edit-budget-btn" onClick={() => setIsEditing(true)}>예산 설정</button>
              
              <p style={{ fontSize: '25px', fontWeight: 'bold' }}>
                {isDataLoading 
                  ? '로딩 중...' 
                  : <><strong>{totalAssetData?.totalAsset?.toLocaleString() || '0'}</strong> 원</>}
              </p>
              
              <div style={{ marginTop: '10px' , paddingTop : '3px'}}>
                <p>현재 수익 / 목표 예산</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'gold' }}>
                    {isDataLoading ? '로딩 중...' : `${formatValue(currentMonthReceived)} 원`}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'gray' }}> / </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#82CA9D' }}>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={budget}
                          onChange={handleBudgetChange}
                          placeholder="목표 예산을 입력하세요."
                        />
                        <button onClick={handleSaveBudget} className="edit-budget-btn">수정 완료</button>
                        <button className="budget-cancel-btn" onClick={handleCancelEdit}>취소</button>
                      </>
                    ) : (
                      <>{currentBudget} 원</>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>
        <div className="progress-charts">
          <div className="progress-chart">
          <div className="progress-label">전체 지출 평균</div>
            <ResponsiveContainer width="200%" height={260}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex1}
                  activeShape={renderActiveShape}
                  data={data1}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter1}
                  isAnimationActive={true}
                />
              </PieChart>
            </ResponsiveContainer>
            
          </div>
          <div className="progress-chart">
          <div className="progress-label">이달 사용 금액</div>
            <ResponsiveContainer width="200%" height={260}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex2}
                  activeShape={renderActiveShape}
                  data={data2}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                  onMouseEnter={onPieEnter2}
                  isAnimationActive={true}
                />
              </PieChart>
            </ResponsiveContainer>
            
          </div>
        </div>
      </section>
      <section className="myassetplaner-content">
        <div className="left-column">
          <Link to="/household" className="ledger-header">
            <h2>가계부</h2>
            <img src={householdButtonIcon} alt="Household Button Icon" />
          </Link>
          <div className="budget">
            <h2 className="budget-loan-h2">예적금</h2>
            {!isEditingSavings && (
              <button className="edit-deposit-btn" onClick={handleEditSavings}>수정</button>
            )}
            <table className="budget-table">
              <thead className="budget-thead">
                <tr>
                  <th>분류</th>
                  <th>월 고정 지출</th>
                  <th>전체 금액</th>
                </tr>
              </thead>
              <tbody className="budget-tbody">
                <tr>
                  <td>정기 예금</td>
                  <td>-</td>
                  <td>
                    {isEditingSavings ? (
                      <input
                        type="text"
                        value={editedDeposit}
                        onChange={handleDepositChange} 
                      />
                    ) : (
                      formatValue(deposit)
                    )}
                  </td>
                </tr>
                <tr>
                  <td>적금</td>
                  <td>100,000</td>
                  <td>
                    {isEditingSavings ? (
                      <input
                        type="text"
                        value={editedInstallmentSaving}
                        onChange={handleInstallmentSavingChange}
                      />
                    ) : (
                      formatValue(installmentSaving)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            {isEditingSavings && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleSaveSavings} className="edit-budget-btn">수정 완료</button>
                <button className="budget-cancel-btn" onClick={() => setIsEditingSavings(false)}>취소</button>
              </div>
            )}
          </div>
          <div className="loan">
            <h2 className="budget-loan-h2">대출</h2>
            {!isEditingLoan && (
              <button className="edit-loan-btn" onClick={handleEditLoan}>수정</button>
            )}
            <table className="loan-table">
              <thead className="loan-thead">
                <tr>
                  <th>만기일</th>
                  <th>총 대출액</th>
                  <th>상환 금액</th>
                  <th>남은 대출액</th>
                </tr>
              </thead>
              <tbody className="loan-tbody">
                <tr>
                  <td>2030-09-01</td>
                  <td>
                    {isEditingLoan ? (
                      <input
                        type="text"
                        value={editedLoan}
                        onChange={handleLoanChange}
                      />
                    ) : (
                      formatValue(userLoan)
                    )}
                  </td>
                  <td>1,000,000</td>
                  <td>2,000,000</td>
                </tr>
              </tbody>
            </table>
            {isEditingLoan && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleSaveLoan} className="edit-budget-btn">수정 완료</button>
                <button className="budget-cancel-btn" onClick={() => setIsEditingLoan(false)}>취소</button>
              </div>
            )}
          </div>
        </div>
        <div className="right-column">
          <div className="stock-summary">
            <div className="total-income">
              <span className="total-income-summary-label">투자 순수익</span>
              <img src={totalIncomIcon} alt="Total Income Icon" />
              <p>{formatValue(total.totalProfit)} 원</p>
            </div>
            <div className="return-of-equity">
              <span className="total-income-summary-label">투자 수익률</span>
              <img src={returnEquityIcon} alt="Return of Equity Icon" />
              <p>{total.totalROE !== undefined && total.totalROE !== null ? total.totalROE : '0.00'}%</p>
            </div>
          </div>
          <div className="stocks">
            <div className="stock-list-header">
            <h2>내 투자</h2>
              {/* 검색창을 버튼으로 변경 */}
              <button onClick={openModal} className="invest-open-modal-btn">세부사항</button>
            </div>
            <table className="stock-table">
              <thead className="stock-thead">
                <tr>
                  <th>종목</th>
                  <th>수익률</th>
                  <th>총액</th>
                  <th>보유 수량</th>
                </tr>
              </thead>
              <tbody className="stock-tbody">
                <tr>
                  <td className="stock-name">
                    <img src={samsungIcon} alt="Samsung Icon" />
                    <span>Samsung<br></br>Electronics</span>
                  </td>
                  <td>{samsungStock.returnOfEquity !== undefined ? samsungStock.returnOfEquity : '0.00'}%</td>
                  <td>{formatValue(samsungStock.currentValue)} 원</td>
                  <td>{formatValue(samsungStock.amount)} 주</td>
                </tr>
                <tr>
                  <td className="stock-name">
                    <img src={appleIcon} alt="Apple Icon" />
                    <span>Apple</span>
                  </td>
                  <td>{appleStock.returnOfEquity !== undefined ? appleStock.returnOfEquity : '0.00'}%</td>
                  <td>{formatValue(appleStock.currentValue)} 원</td>
                  <td>{formatValue(appleStock.amount)} 주</td>
                </tr>
                <tr>
                  <td className="stock-name">
                    <img src={bitcoinIcon} alt="Bitcoin Icon" />
                    <span>Bitcoin</span>
                  </td>
                  <td>{coin.returnOfEquity !== undefined ? coin.returnOfEquity : '0.00'}%</td>
                  <td>{formatValue(coin.currentValue)} 원</td>
                  <td>{formatValue(coin.amount)} coin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 모달 추가 */}
      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default MyAssetPlaner;