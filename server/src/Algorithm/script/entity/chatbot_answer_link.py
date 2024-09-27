import re
import time
import pytz
import calendar
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
# import Chatbot_Entity_date as ed

import nltk
import spacy
from konlpy.tag import Okt, Kkma
from spacy.tokens import Span
# from pykospacing import Spacing
from soynlp.normalizer import repeat_normalize
from typing import List, Dict, Optional, Tuple, Set, Union

okt = Okt()
kkma = Kkma()
# spacing = Spacing()
kst = pytz.timezone('Asia/Seoul')  # 한국 표준시(KST) 타임존 설정

# # 텍스트 전처리
# def processe_text(text):
#     text = spacing(text)
#     text = re.sub(r"[^가-힣a-zA-Z0-9\s]", "", text)
#     text = repeat_normalize(text, num_repeats=3)
#     text = re.sub(r'\s+', ' ', text).strip()

#     return text


# 의도=금융 엔티티 추출 함수
def extract_finance_entities(text):

    # 금융 관련 패턴
    patterns = {
        "소비": r"지출|소비|쓴|사용|결제|카드",
        "수입": r"수입|소득|월급|급여",
        "예산": r"예산",
        "대출": r"대출",
        "저축": r"적금|예금|저축",
        "입출금": r"입출금|입금|출금|이체|송금|인출|납부",
        "자산" : r"보유|자산|재정|재무|자본|재산|잔고",
        "주식" : r"주식|삼성|삼전|애플|코인|비트코인|samsung|apple|coin|bitcoin",
        "구매" : r"구매|구입|매입|매수|투자|\b산\b",
        "판매" : r"판매|매도|\b판\b|처분",
        "가계부": r"가계부|가계|금전",
    }

    # 표현 패턴
    patterns2 = {
        "stats" : r"비교|통계|보고|정리|분석|현황",  # 내역+합계
        "simple" : r"내역|상황|항목|목록|기록|출처|조회|정보|사항|이력|내용",  # 내역
        "sum" : r"합계|총액|잔액|잔고|총합|누적|합산|총계|전체금액|최종금액",  # 합계
        "average" : r"평균",  # 평균
        "date" : r"언제",  # 날짜
        "sort" : r"가장|큰|작은|제일|많이|적게|높은|낮은|순위|순서|자주|반복|빈번|주요|적은|많은",  # 정렬
    }

    # 패턴에 맞는 주요 키워드 추출 함수
    def extract_main_keyword(text, pattern):
        match = re.search(pattern, text)
        if match:
            return match.group(0)
        return None

    # 텍스트에서 조사를 제거하는 함수
    def clean_text(text):
        cleaned_text = re.sub(r'(과|와|의|가|이|을|를|은|는|에서|으로|고|까지|부터|도|만|조차|뿐|에|와|에서|로)$', '', text)
        return cleaned_text

    # 사용자 정의 spaCy 파이프라인 컴포넌트
    @spacy.Language.component("custom_finance_entity_adder")
    def custom_finance_entity_adder(doc):
        
        new_ents = []
        for token in doc:
            noun_phrase = ''.join([word for word, tag in okt.pos(token.text) if tag in ['Noun', 'Alpha']])
            noun_phrase_cleaned = clean_text(noun_phrase)
            original_text_cleaned = clean_text(token.text)

            found_pattern1 = False
            found_pattern2 = False

            # 패턴1 매칭
            for label, pattern in patterns.items():
                main_keyword = extract_main_keyword(noun_phrase_cleaned, pattern)
                if main_keyword:
                    new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern1")
                    new_ent._.set("cleaned_text", noun_phrase_cleaned)
                    new_ents.append(new_ent)
                    found_pattern1 = True
                    break

            if not found_pattern1:
                for label, pattern in patterns2.items():
                    main_keyword = extract_main_keyword(noun_phrase_cleaned, pattern)
                    if main_keyword:
                        new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern2")
                        new_ent._.set("cleaned_text", noun_phrase_cleaned)
                        new_ents.append(new_ent)
                        found_pattern2 = True
                        break

            # 형태소 분석 결과에 매칭되지 않은 경우, 원래 텍스트로 매칭 시도
            if not found_pattern1 and not found_pattern2:
                for label, pattern in patterns.items():
                    main_keyword = extract_main_keyword(original_text_cleaned, pattern)
                    if main_keyword:
                        new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern1")
                        new_ent._.set("cleaned_text", original_text_cleaned)
                        new_ents.append(new_ent)
                        break

            if not found_pattern1 and not found_pattern2:
                for label, pattern in patterns2.items():
                    main_keyword = extract_main_keyword(original_text_cleaned, pattern)
                    if main_keyword:
                        new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern2")
                        new_ent._.set("cleaned_text", original_text_cleaned)
                        new_ents.append(new_ent)
                        break

        doc.ents = new_ents

        return doc

    # spaCy 모델 로드
    nlp = spacy.load("ko_core_news_sm")

    # 확장 속성 등록 (cleaned_text)
    Span.set_extension("cleaned_text", default=None, force=True)

    # custom_finance_entity_adder가 이미 파이프라인에 존재하면 제거
    if "custom_finance_entity_adder" in nlp.pipe_names:
        nlp.remove_pipe("custom_finance_entity_adder")

    # custom_finance_entity_adder를 spaCy 파이프라인에 추가
    nlp.add_pipe("custom_finance_entity_adder", after="ner")

    # 텍스트 처리
    doc = nlp(text)

    # 결과 출력
    entities = {"pattern1": [], "pattern2": []}
    
    for ent in doc.ents:
        if "_pattern1" in ent.label_:
            entities["pattern1"].append((ent._.get("cleaned_text"), ent.label_.replace("_pattern1", "")))
        elif "_pattern2" in ent.label_:
            entities["pattern2"].append((ent._.get("cleaned_text"), ent.label_.replace("_pattern2", "")))
        
    if not entities['pattern2']:
        entities['pattern2'].append(('기본값', 'simple'))
    return entities


# 의도=주식 앤티티 추출
def extract_stock_entities(text):

    text = text.replace('주가', '주가가')

    # 주식 관련 패턴 정의
    patterns1 = {
        "SAMSUNG": r"삼성전자|삼성|삼전|samsung",
        "APPLE": r"애플|apple",
        "BITCOIN": r"비트코인|bitcoin|비트|코인|coin",
    }

    # 주식 관련 예측 및 변동성 패턴 정의
    patterns2 = {
        "주가": r"주식|\b주가\b|종가|가격",
        "증시": r"증시",
        "PER": r"PER|주가수익비율|Price Earning Ratio|per",
        "PBR": r"PBR|주가순자산비율|Price Book-value Ratio|pbr",
        "ROE": r"ROE|자기자본이익률|Return on Equity|roe",
        "시가총액": r"MC|시가총액|총액|시총|Market Cap|mc",
        "경제지표": r"경제지표|국내총생산|GDP|기준금리|IR|수입물가지수|IPI|생산자물가지수|PPI|소비자물가지수|CPI|외환보유액",
        "주가예측": r"예상|예측",
    }

    # 패턴에 맞는 주요 키워드 추출 함수
    def extract_main_keyword(text, pattern):
        match = re.search(pattern, text)
        if match:
            return match.group(0)
        return None

    # 텍스트에서 조사를 제거하는 함수
    def clean_text(text):
        cleaned_text = re.sub(r'(과|와|의|가|이|을|를|은|는|에서|으로|고|까지|부터|도|만|조차|뿐|에|와|에서|로)$', '', text)
        return cleaned_text

    # 사용자 정의 spaCy 파이프라인 컴포넌트
    @spacy.Language.component("custom_stock_entity_adder")
    def custom_stock_entity_adder(doc):
        
        new_ents = []
        for token in doc:
            noun_phrase = ''.join([word for word, tag in okt.pos(token.text) if tag in ['Noun', 'Alpha']])
            noun_phrase_cleaned = clean_text(noun_phrase)
            original_text_cleaned = clean_text(token.text)

            found_pattern1 = False
            found_pattern2 = False

            # 패턴1 매칭
            for label, pattern in patterns1.items():
                main_keyword = extract_main_keyword(noun_phrase_cleaned, pattern)
                if main_keyword:
                    new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern1")
                    new_ent._.set("cleaned_text", noun_phrase_cleaned)
                    new_ents.append(new_ent)
                    found_pattern1 = True
                    break

            if not found_pattern1:
                for label, pattern in patterns2.items():
                    main_keyword = extract_main_keyword(noun_phrase_cleaned, pattern)
                    if main_keyword:
                        new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern2")
                        new_ent._.set("cleaned_text", noun_phrase_cleaned)
                        new_ents.append(new_ent)
                        found_pattern2 = True
                        break

            # 형태소 분석 결과에 매칭되지 않은 경우, 원래 텍스트로 매칭 시도
            if not found_pattern1 and not found_pattern2:
                for label, pattern in patterns1.items():
                    main_keyword = extract_main_keyword(original_text_cleaned, pattern)
                    if main_keyword:
                        new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern1")
                        new_ent._.set("cleaned_text", original_text_cleaned)
                        new_ents.append(new_ent)
                        break

            if not found_pattern1 and not found_pattern2:
                for label, pattern in patterns2.items():
                    main_keyword = extract_main_keyword(original_text_cleaned, pattern)
                    if main_keyword:
                        new_ent = Span(doc, token.i, token.i + 1, label=f"{label}_pattern2")
                        new_ent._.set("cleaned_text", original_text_cleaned)
                        new_ents.append(new_ent)
                        break

        doc.ents = new_ents

        return doc

    # spaCy 모델 로드
    nlp = spacy.load("ko_core_news_sm")

    # 확장 속성 등록 (cleaned_text)
    Span.set_extension("cleaned_text", default=None, force=True)

    # custom_stock_entity_adder가 이미 파이프라인에 존재하면 제거
    if "custom_stock_entity_adder" in nlp.pipe_names:
        nlp.remove_pipe("custom_stock_entity_adder")

    # custom_stock_entity_adder를 spaCy 파이프라인에 추가
    nlp.add_pipe("custom_stock_entity_adder", after="ner")

    # 텍스트 처리
    doc = nlp(text)

    # 결과 출력
    entities = {"pattern1": [], "pattern2": []}
    
    for ent in doc.ents:
        if "_pattern1" in ent.label_:
            entities["pattern1"].append((ent._.get("cleaned_text"), ent.label_.replace("_pattern1", "")))
        elif "_pattern2" in ent.label_:
            entities["pattern2"].append((ent._.get("cleaned_text"), ent.label_.replace("_pattern2", "")))
        
    if not entities['pattern2']:
        entities['pattern2'].append(('기본값', 'PRICE'))
    return entities


# 앤티티 2개일때, 1개만 남기기
def filter_finance_entities(entities):
    entity_map = {
        "자산": 0,             # 보유|자산|재정|재무|자본|재산|잔고
        "가계부": 0,               # 가계부 등
        "주식": 2,             # 주식|삼성|삼전|애플|코인|비트코
        "저축": 2,   # 적금|예금|저축
        "대출": 2,              # 대출
        "수입": 2,            # 수입|소득|월급|급여
        "예산": 2,            # 예산
        "입출금": 1,       # 입출금|입금|출금|이체|송금|인출|납부
        "소비": 1        # 지출|소비|쓴|사용|결제|카드
    }

    vs = []
    for i in entities:
        a = {i : entity_map[i]}
        vs.append(a)

    vs2 = {}
    for i in vs:
        if len(vs2) != 0:
            ivalue = list(i.values())
            vs2value = list(vs2.values())
            if ivalue[0] > vs2value[0]:
                vs2.clear()
                vs2[list(i.keys())[0]] = list(i.values())[0]
            elif ivalue[0] == vs2value[0]:
                vs2[list(i.keys())[0]] = list(i.values())[0]
        else:
            vs2[list(i.keys())[0]] = list(i.values())[0]
    return list(vs2.keys())

def filter_stock_entities(entities):
    entity_map = {
        "주가": 0,
        "증시": 0,
        "PER": 0,
        "PBR": 0,        
        "ROE": 0,
        "시가총액": 0,
        "경제지표": 0,
        "주가예측": 1,
    }

    vs = []
    for i in entities:
        a = {i : entity_map[i]}
        vs.append(a)

    vs2 = {}
    for i in vs:
        if len(vs2) != 0:
            ivalue = list(i.values())
            vs2value = list(vs2.values())
            if ivalue[0] > vs2value[0]:
                vs2.clear()
                vs2[list(i.keys())[0]] = list(i.values())[0]
            elif ivalue[0] == vs2value[0]:
                vs2[list(i.keys())[0]] = list(i.values())[0]
        else:
            vs2[list(i.keys())[0]] = list(i.values())[0]
    return list(vs2.keys())


# 재무 링크 답변 생성
def link_finance_entity(f_entity, text):

    entity1 = (f_entity['pattern1'])
    entity2 = (f_entity['pattern2'])

    entity_pattern = []
    for i in range(len(entity1)):
        entity_pattern.append(entity1[i][1])
    entity_pattern = list(set(entity_pattern))


    if len(entity_pattern) > 1:
        entity_pattern = filter_finance_entities(entity_pattern)
    
    
    if entity_pattern[0] == "소비":  # "EXPENDITURE": r"지출|소비|쓴|사용|결제|카드",
        link = "http://localhost:3000/household"
        return link
    elif entity_pattern[0] == "수입":  # "INCOME": r"수입|소득|월급|급여",
        link = "http://localhost:3000/household"
        return link
    elif entity_pattern[0] == "예산":  # "BUDGET": r"예산",
        link = "http://localhost:3000/myassetplaner"
        return link
    elif entity_pattern[0] == "대출":  # "LOAN": r"대출",
        if '상환' in text:
            link = "http://localhost:3000/household"
            return link
        else:
            link = "http://localhost:3000/myassetplaner"
            return link
    elif entity_pattern[0] == "저축":  # "DEPOSIT_SAVINGS": r"적금|예금|저축",
        link = "http://localhost:3000/household"
        return link
    elif entity_pattern[0] == "입출금":  # "TRANSACTION": r"입출금|입금|출금|이체|송금|인출|납부",
        link = "http://localhost:3000/household"
        return link
    elif entity_pattern[0] == "자산":  # "ASSET" : r"보유|자산|재정|재무|자본|재산|잔고",
        link = "http://localhost:3000/myassetplaner"
        return link
    elif entity_pattern[0] == "주식":  # "STOCK" : r"주식|삼성|삼전|애플|코인|비트코인|samsung|apple|coin|bitcoin",
        link = "http://localhost:3000/myassetplaner"
        return link
    elif entity_pattern[0] == "구매":  # "buy" : r"구매|구입|매입|매수|투자|\b산\b",
        link = "http://localhost:3000/myassetplaner"
        return link
    elif entity_pattern[0] == "판매":  # "sell" : r"판매|매도|\b판\b|처분",
        link = "http://localhost:3000/myassetplaner"
        return link
    elif entity_pattern[0] == "가계부":  # "ALL": r"가계부|가계|금전",
        link = "http://localhost:3000/household"
        return link


# 주식 링크 답변 생성
def link_stock_entity(s_entity):

    entity1 = (s_entity['pattern1'])
    entity2 = (s_entity['pattern2'])

    entity_pattern = []
    for i in range(len(entity2)):
        entity_pattern.append(entity2[i][1])
    entity_pattern = list(set(entity_pattern))

    if len(entity_pattern) > 1:
        entity_pattern = filter_stock_entities(entity_pattern)
    
    if entity_pattern[0] == "주가":
        link = "http://localhost:3000/stockchart"
        return link
    elif entity_pattern[0] == "증시":
        link = "http://localhost:3000/stockchart"
        return link
    elif entity_pattern[0] == "PER" or entity_pattern[0] == "PBR" or entity_pattern[0] == "ROE" or entity_pattern[0] == "시가총액":
        link = "http://localhost:3000/stockchart"
        return link
    elif entity_pattern[0] == "경제지표":
        link = "http://localhost:3000/stockchart"
        return link
    elif entity_pattern[0] == "주가예측":
        link = "http://localhost:3000/stockprediction"
        return link

# 링크 생성
def answer_link(intention, text):
    answer = {}
    if intention == "finance":
        f_entity = extract_finance_entities(text)
        if len(f_entity['pattern1']) == 0:
            answer['예외'] = "앤터티=0"
            return answer
        else:
            answer[f'{f_entity["pattern1"][0][1]}'] = link_finance_entity(f_entity, text)
        return answer
    elif intention == "stock":
        s_entity = extract_stock_entities(text)
        if len(s_entity['pattern2']) == 0:
            answer['예외'] = "앤터티=0"
            return answer
        answer[f'{s_entity["pattern2"][0][1]}'] = link_stock_entity(s_entity)
        return answer
    elif intention == "FAQ":
        answer['FAQ_link'] = "http://localhost:3000/faq"
        return answer
    else:
        answer['예외'] = "의도인식을 할 수 없습니다."
        return answer