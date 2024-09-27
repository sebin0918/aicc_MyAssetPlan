import React, { useEffect, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import "../styles/FAQ.css";

const categories = [
  { name: "자주 묻는 질문", value: "category1" },
  { name: "기술지원", value: "category2" },
];

const qnaList = [
  {
    category: "category1",
    question: "Q. 계정 정보를 업데이트하려면 어떻게 해야 하나요?",
    answer: "A.  계정 정보를 업데이트하려면 우측 상단 사용자 아이콘을 클릭하여 '마이페이지'로 이동하여 현재 비밀번호를 입력합니다.\n   ID로 활용되는 이메일을 제외한 정보를 수정할 수 있습니다.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 계정을 삭제하려면 어떤 절차를 따라야 하나요?",
    answer: "A.  계정을 삭제하려면 우측 상단에 사용자 아이콘을 클릭하여 '마이페이지'로 이동하여 현재 비밀번호를 입력합니다.\n   '회원탈퇴' 를 선택하고, 안내에 따라 회원 탈퇴 절차를 완료하세요.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 로그아웃은 어떻게 하나요?",
    answer: "A.  로그아웃은 우측 상단 메뉴의 '로그아웃' 버튼을 선택하면 됩니다.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 로그인 문제를 해결하려면 어떻게 해야 하나요?", // 확장성
    answer: "A.  로그인 문제가 발생하면 먼저 비밀번호가 올바른지 확인하고, 문제가 지속되면 '비밀번호 찾기'를 통해 재설정하거나 고객 지원팀에 문의하세요.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 새로운 계정을 생성하려면 어떻게 해야 하나요?",
    answer: "A.  회원가입은 우측 상단 '회원가입' 버튼을 클릭하고 필요한 정보를 입력하여 완료할 수 있습니다.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 비밀번호를 변경하려면 어떻게 해야 하나요?",
    answer: "A.  비밀번호 변경은 '마이페이지'에서 가능합니다. 현재 비밀번호를 입력하고 새 비밀번호로 변경하세요.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 이메일 주소를 변경하려면 어떻게 해야 하나요?",
    answer: "A.  이메일 주소는 저희 서비스에서 ID로 활용되고 있기 때문에 변경이 불가합니다. 새로 가입 해주시거나 지원팀에 문의하세요.",
    show: false,
  },
  {
    category: "category1",
    question: "Q. 페이지가 동작하지 않아요.",
    answer: "A.  현재 사이트나 서버에 문제가 발생한 것으로 보입니다.\n   새로고침을 시도하시거나, 사이트에 재접속 또는 재로그인을 해보시기 바랍니다.\n   문제가 계속될 경우, 010-0000-0000으로 문의해주시면 도움을 드리겠습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 'My Asset Planner' 란 무엇인가요?",
    answer: "A.  'My Asset Planner'는 사용자가 보유한 자산 정보를 한눈에 확인하고, 효과적인 미래 재산 관리를 지원하는 기능을 제공합니다.\n   이를 통해 총 자산 규모를 확인하고, 지출 현황을 파악할 수 있으며, 보유 대출 및 예적금의 내용을 상세히 알 수 있습니다.\n   또한, 보유한 주식의 개별 현황과 총 수익에 대한 정보도 제공하여 자산 관리에 필요한 모든 정보를 한 곳에서 쉽게 확인할 수 있습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 가계부란 무엇인가요?",
    answer: "A.  '가계부'는 캘린더 형태로 구성되어 있어 일별 수입과 지출 현황을 직관적으로 확인할 수 있도록 설계되었습니다.\n   특정 일자를 클릭하면 해당 일자의 수입 및 지출 상세 내역을 확인할 수 있으며, 메모 기능을 통해 각 일자의 중요한 내역을 기록할 수 있습니다.\n   이를 통해 사용자는 일상적인 가계 관리를 보다 쉽고 체계적으로 수행할 수 있습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 경제뉴스란 무엇인가요?",
    answer: "A.  '경제뉴스'는 직전 하루 동안의 경제 뉴스를 요약하여 제공하는 페이지로,\n   사용자가 원문을 읽지 않고도 중요한 내용을 빠르게 파악할 수 있도록 합니다. 뉴스는 호재와 악재로 구분되어 직관적으로 표시되며,\n   이를 통해 그 날의 시장 상황을 한눈에 쉽게 확인할 수 있도록 구성되었습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 뉴스는 어떻게 요약되나요?",
    answer: "A.  뉴스는 00뉴스 사이트 API에서 뉴스 원문 텍스트 데이터를 가져와 00요약모델을 활용하여 요약하여 보여드리고 있습니다.",
    show: false,
  },
  {
    category: "category2",
    question: "Q. 통합채팅방은 무엇인가요?",
    answer: "A.  '통합 채팅방'은 유저들이 자유롭게 대화할 수 있는 공간으로, 00:00시 기준 24시간 동안의 채팅 내용을 확인할 수 있습니다.\n   이 채팅방에서는 주식, 경제, 재정 등 다양한 주제에 대해 유저들이 의견을 나누고 정보를 공유할 수 있습니다.\n   이를 통해 유저들은 실시간으로 소통하며 유익한 대화 콘텐츠를 즐길 수 있습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 차트 비교는 무엇인가요?",
    answer: "A.  '차트 비교'는 삼성, 애플, 비트코인 세 가지의 차트를 다양한 지표와 함께 비교하여 주식과 각 차트 간의 상관관계를 파악할 수 있는 기능입니다.\n   이를 통해 각 자산의 변동 추이와 패턴을 분석하며, 서로의 연관성을 쉽게 이해할 수 있도록 돕습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 주식 예측은 무엇인가요?",
    answer: "A.  '주식 예측'은 다양한 예측 모델을 활용하여 주가를 예측하는 페이지로,\n   80% 이상의 정확도를 보이는 모델만을 사용하여 단기, 중기, 장기 관점에서 다양한 주가 예측을 제공합니다.\n   이를 통해 사용자는 보다 신뢰성 있는 예측 정보를 기반으로 투자 결정을 내릴 수 있습니다.",
    show: false
  },
  {
    category: "category2",
    question: "Q. 주식 예측은 어떤 원리로 진행되나요?",
    answer: "A.  주식 예측은 과거 주가 데이터를 활용하여 미래의 주가를 예측해주는 원리로 이뤄집니다.",
    show: false,
  },
  {
    category: "category2",
    question: "Q. 챗봇이란 무엇인가요?",
    answer: "A.  챗봇을 통해 사용자는 사이트 내에서 페이지를 직접 이동하여 기능을 조작할 필요 없이,\n   질문에 대한 즉각적인 답변을 받음으로써 편리하게 기능을 활용할 수 있습니다.\n   이를 통해 사용자의 편의성을 증대시키고, 각 기능의 활용성을 높일 수 있습니다.",
    show: false,
  }
];

const FAQ = () => {
  const [category, setCategory] = useState("category1");
  const [cardOnOff, setCardOnOff] = useState(qnaList);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    setShowList(cardOnOff.filter((item) => category === item.category));
  }, [category, cardOnOff]);

  const toggleCard = (question) => {
    const updatedCards = cardOnOff.map((card) => 
      card.question === question ? { ...card, show: !card.show } : card
    );
    setCardOnOff(updatedCards);
  };

const getQnACard = (item) => {
  return (
    <div className="faq-card" key={item.question}>
      <div
        className="faq-card-title"
        onClick={() => toggleCard(item.question)}
      >
        <span>{item.question}</span>
        <span className="faq-toggle">{item.show ? "-" : "+"}</span>
      </div>
      <div className={item.show ? "faq-card-answer show" : "faq-card-answer"}>
        {/* A. 부분만 기본 폰트 적용, 나머지는 monospace 유지 */}
        <span>
          <strong style={{ fontFamily: 'inherit' }}>A.</strong> 
          <span style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{item.answer.slice(3)}</span>
        </span>
      </div>
    </div>
  );
};

  return (
    <div className="faq-container">
      <div className="faq-title">FAQ</div>
      <div className="faq-separator"></div>
      <CategoryFilter categories={categories} category={category} setCategory={setCategory} />
      <div className="faq-list">{showList.map((item) => getQnACard(item))}</div>
    </div>
  );
};

export default FAQ;
