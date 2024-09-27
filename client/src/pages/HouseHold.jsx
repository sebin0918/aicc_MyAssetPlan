import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/HouseHold.css';

const HouseHold = () => {
  const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [incomeEvents, setIncomeEvents] = useState([]);
  const [expenseEvents, setExpenseEvents] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [memos, setMemos] = useState({});
  const [selectedMemo, setSelectedMemo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 서버에서 이벤트 데이터 가져오기
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/household/HouseHold`);
        if (!response.ok) {
          throw new Error('Failed to fetch data from server');
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.data)) {
          console.error('Fetched data is not an array or is undefined:', data);
          return;
        }

        const formattedEvents = data.data.map((event) => {
          const eventType = parseInt(event.rp_part) === 0 ? '입금' : '출금'; 
          const rpAmount = parseFloat(event.rp_amount) || 0;
          return {
            start: event.rp_date,
            title: `${eventType}: ₩${rpAmount.toLocaleString()}원`, // 통화 기호와 포맷 수정
            type: eventType,
            rp_amount: rpAmount,
            rp_detail: event.rp_detail,
            allDay: true                                            // 시간을 제거하고 날짜만 표시
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching household data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 선택된 날짜의 총 입금과 출금 계산
  const calculateTotals = (dateStr) => {
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.start);
      const eventDateStr = eventDate
        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\. /g, '-')
        .replace(/\./g, '');
      return eventDateStr === dateStr;
    });

    const incomeEvents = dayEvents.filter((e) => e.type === '입금');
    const expenseEvents = dayEvents.filter((e) => e.type === '출금');

    const totalIncome = incomeEvents.reduce((sum, e) => sum + e.rp_amount, 0);
    const totalExpense = expenseEvents.reduce((sum, e) => sum + e.rp_amount, 0);

    return { totalIncome, totalExpense, incomeEvents, expenseEvents };
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    const { totalIncome, totalExpense, incomeEvents, expenseEvents } = calculateTotals(info.dateStr);
    setTotalIncome(totalIncome);
    setTotalExpense(totalExpense);
    setIncomeEvents(incomeEvents);
    setExpenseEvents(expenseEvents);

    setSelectedMemo(memos[info.dateStr] ? memos[info.dateStr] : '');
    setIsModalOpen(true);
  };

  // 서버로 데이터 저장 함수
  const saveDataToServer = async (data) => {
    console.log('Saving data to server:', data);  // 전송 데이터 확인
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/household/addHouseHoldData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save data to the server');
      }
  
      const result = await response.json();
      console.log('Data saved:', result);
      return result;
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  // 임시저장 클릭 핸들러
  const handleSaveButtonClick = async (type) => {
    const detailInput = document.getElementById(`house_transaction-detail${type === 'minus' ? '-minus' : ''}`);
    const amountInput = document.getElementById(`house_transaction-amount${type === 'minus' ? '-minus' : ''}`);
    const checkBox = document.getElementById(`household_check_hold${type === 'minus' ? '_minus' : ''}`);

    if (!detailInput || !amountInput || !checkBox) {
      console.error('One or more input elements are missing');
      return;
    }

    const detail = detailInput.value;
    const amount = amountInput.value;
    const isFixed = checkBox.checked ? 0 : 1;

    const data = {
      rp_date: selectedDate,
      rp_detail: detail,
      rp_amount: parseFloat(amount),
      rp_hold: isFixed, 
    };

    const savedData = await saveDataToServer(data);

    if (savedData) {
      const newEvent = {
        start: selectedDate,
        title: `${type === 'plus' ? '입금' : '출금'}: ₩${parseFloat(amount).toLocaleString()}원`,
        rp_amount: parseFloat(amount),
        rp_detail: detail,
        type: type === 'plus' ? '입금' : '출금',
      };

      // 저장된 후 새로운 이벤트 반영
      setEvents((prevEvents) => [...prevEvents, newEvent]);

      if (type === 'plus') {
        setIncomeEvents((prevIncome) => [...prevIncome, newEvent]);
      } else {
        setExpenseEvents((prevExpense) => [...prevExpense, newEvent]);
      }

      calculateTotals(selectedDate);

      // 입력 필드 초기화
      detailInput.value = '';
      amountInput.value = '';
      checkBox.checked = false;
    }
  };

  // 메모 변경 핸들러 함수 정의
  const handleMemoChange = (event) => {
    setSelectedMemo(event.target.value);
    setIsEditing(true);
  };

  // 메모 저장 및 수정 핸들러 함수 정의
  const handleEditButtonClick = () => {
    if (isEditing) {
      setMemos((prevMemos) => ({ ...prevMemos, [selectedDate]: selectedMemo }));
      setIsEditing(false);
      setIsModalOpen(false);
    } else {
      setIsEditing(true);
    }
  };

  // dayCellDidMount 함수로 각 셀에 총 입금/총 출금을 표시
  const dayCellDidMount = (info) => {
    const dateStr = info.date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\. /g, '-')
      .replace(/\./g, '');
    
    const { totalIncome, totalExpense } = calculateTotals(dateStr);

    const content = (
      <div className="house_total-container">
        <div className="household_plustotalpay2">
          총 입금: + {totalIncome.toLocaleString()}원
        </div>
        <div className="household_minustotalpay2">
          총 출금: - {totalExpense.toLocaleString()}원
        </div>
      </div>
    );

    ReactDOM.render(content, info.el.querySelector('.fc-daygrid-day-top'));
  };

  return (
    <div className="household">
      <div className="household-body">
        <div className="household-header">
          <h1>가계부</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events} // 이벤트 렌더링 활성화
              dateClick={handleDateClick}
              dayCellDidMount={dayCellDidMount} // 추가된 부분
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: '',
              }}
              timeZone="local"
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="household-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="household-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="household-modal-header">
              <h5 className="household-modal-title">Date Info</h5>
            </div>

            <div className="household-modal-body">
              <div id="household-modalDate">{selectedDate}</div>
              <div className="household-box-container">
                <div id="household-plusbox">
                  <h2>[ 입금 내역 ]</h2>
                  <div className="household_plustotalpay">
                    총 입금: <span style={{ fontWeight: 'bold' }}>{`+ ${totalIncome.toLocaleString()}원`}</span>
                  </div>
                  {incomeEvents.map((event, index) => (
                    <div key={index}>
                      <div className="household_plusdetail">{`${index + 1}. ${event.rp_detail} : + ${event.rp_amount.toLocaleString()}원`}</div>
                    </div>
                  ))}
                  {isEditing && (
                    <div className="household_plusinbuttonbox">
                      <div>
                        <label className="household_plus_in_detailtext" htmlFor="house_transaction-detail">
                          거래 내역
                        </label>
                        <input type="text" id="house_transaction-detail" className="household_plus_in_detail" />
                      </div>

                      <div>
                        <label className="household_plus_in_amounttext" htmlFor="house_transaction-amount">
                          금액
                        </label>
                        <input type="text" id="house_transaction-amount" className="household_plus_in_amount" />
                      </div>
                      <div className="household_plus_in_check_hold">
                        <label className="household_plus_in_check_holdtext">고정</label>
                        <input type="checkbox" id="household_check_hold" className="household_check_hold" />
                      </div>
                      <div>
                        <button className="household_plus_in_btn_save" onClick={() => handleSaveButtonClick('plus')}>
                          입력
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div id="household-minusbox">
                  <h2>[ 출금 내역 ]</h2>
                  <div className="household_minustotalpay">
                    총 출금: <span style={{ fontWeight: 'bold' }}> {`- ${totalExpense.toLocaleString()}원`}</span>
                  </div>
                  {expenseEvents.map((event, index) => (
                    <div key={index}>
                      <div className="household_minusdetail">{`${index + 1}. ${event.rp_detail} : - ${event.rp_amount.toLocaleString()}원`}</div>
                    </div>
                  ))}
                  {isEditing && (
                    <div className="household_minusinbuttonbox">
                      <div>
                        <label className="household_minus_in_detailtext" htmlFor="house_transaction-detail-minus">
                          거래 내역
                        </label>
                        <input type="text" id="house_transaction-detail-minus" className="household_minus_in_detail" />
                      </div>
                      <div>
                        <label className="household_minus_in_amounttext" htmlFor="house_transaction-amount-minus">
                          금액
                        </label>
                        <input type="text" id="house_transaction-amount-minus" className="household_minus_in_amount" />
                      </div>
                      <div className="household_minus_in_check_hold">
                        <label className="household_minus_in_check_holdtext">고정</label>
                        <input type="checkbox" id="household_check_hold_minus" className="household_check_hold_minus" />
                      </div>
                      <div>
                        <button className="household_minus_in_btn_save" onClick={() => handleSaveButtonClick('minus')}>
                          입력
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div id="household-memobox">
                  <textarea
                    id="memo-textarea"
                    placeholder="MEMO (수정버튼 클릭 후 사용하세요)"
                    value={selectedMemo}
                    onChange={handleMemoChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="household-modal-footer">
              <button
                type="button"
                id="household-edit-btn"
                className="household-btn household-btn-edit"
                onClick={handleEditButtonClick}
              >
                {isEditing ? '수정 완료' : '수정'}
              </button>

              <button
                type="button"
                className="household-btn household-btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                확인
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseHold;
