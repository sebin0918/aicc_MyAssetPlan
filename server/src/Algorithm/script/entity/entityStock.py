import re
import spacy
from spacy.tokens import Span

# spaCy 모델 캐싱 (최초 한 번만 로드)
_cached_nlp = None

def get_spacy_model():
    global _cached_nlp
    if _cached_nlp is None:
        _cached_nlp = spacy.load("ko_core_news_sm", disable=["parser", "tagger", "textcat"])
        Span.set_extension("cleaned_text", default=None, force=True)
    return _cached_nlp

def extract_stock_entities(text):
    # 주식 관련 패턴 정의
    patterns = {
        "삼성전자": r"삼성전자|삼성|삼전|samsung",
        "애플": r"애플|apple",
        "비트코인": r"비트코인|bitcoin|비트|코인|coin",
        "PER": r"PER|주가수익비율|Price Earning Ratio|per",
        "PBR": r"PBR|주가순자산비율|Price Book-value Ratio|pbr",
        "ROE": r"ROE|자기자본이익률|Return on Equity|roe",
        "MC": r"시총|총액|MC|시가총액|Market Cap|mc"
    }

    # 조사 및 종결어미 제거
    def clean_text(text):
        return re.sub(r'(과|와|의|가|이|을|를|은|는|에서|으로|고|까지|부터|도|만|조차|뿐|에|와|에서|로|이다|입니다|해요|하겠습니다)$', '', text)

    # 사용자 정의 spaCy 파이프라인 컴포넌트
    @spacy.Language.component("custom_stock_entity_adder")
    def custom_stock_entity_adder(doc):
        new_ents = []
        for token in doc:
            noun_phrase = clean_text(token.text)
            for label, pattern in patterns.items():
                if re.search(pattern, noun_phrase):
                    new_ent = Span(doc, token.i, token.i + 1, label=label)
                    new_ent._.set("cleaned_text", noun_phrase)
                    new_ents.append(new_ent)
                    break
        doc.ents = new_ents
        return doc

    # spaCy 모델 로드 (캐싱된 모델 사용)
    nlp = get_spacy_model()
    if "custom_stock_entity_adder" not in nlp.pipe_names:
        nlp.add_pipe("custom_stock_entity_adder", after="ner")

    doc = nlp(text)
    entities = [(ent._.get("cleaned_text"), ent.label_) for ent in doc.ents]
    return entities

def stock_information(text):
    entities = extract_stock_entities(text)
    entity_labels = {label for _, label in entities}

    stock_labels = {"삼성전자", "애플", "비트코인"}
    info_labels = {"PBR", "PER", "ROE", "MC"}

    requested_stocks = stock_labels.intersection(entity_labels)
    requested_infos = info_labels.intersection(entity_labels)

    if requested_stocks and requested_infos:
        stock = next(iter(requested_stocks))
        info = next(iter(requested_infos))
        date = "2024-09-01"
        query = f"MPPRSELECT {get_stock_column(stock, info)} FROM tb_stock WHERE fd_date = '{date}';"
        return query
    return ''

def get_stock_column(stock, info):
    stock_column_map = {
        "삼성전자": {"PBR": "sc_ss_pbr", "PER": "sc_ss_per", "ROE": "sc_ss_roe", "MC": "sc_ss_mc"},
        "애플": {"PBR": "sc_ap_pbr", "PER": "sc_ap_per", "ROE": "sc_ap_roe", "MC": "sc_ap_mc"}
    }
    return stock_column_map.get(stock, {}).get(info, '')
