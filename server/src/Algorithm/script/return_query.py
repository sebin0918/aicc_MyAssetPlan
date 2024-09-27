from transformers import AutoTokenizer, AutoModelForSequenceClassification
from soynlp.normalizer import repeat_normalize
from entity import chatbot_answer_link as cal
from pykospacing import Spacing
import argparse
import torch
import json
import sys
import re
import os
import warnings

warnings.filterwarnings("ignore")


# 인코딩
sys.stdout.reconfigure(encoding='utf-8')

current_dir = os.path.dirname(os.path.abspath(__file__))
tokenizer = AutoTokenizer.from_pretrained(current_dir)
model = AutoModelForSequenceClassification.from_pretrained(current_dir, num_labels=3)

# 텍스트 전처리
spacing = Spacing()
def processe_text(text):
    text = spacing(text)
    text = re.sub(r"[^가-힣a-zA-Z0-9\s]", "", text)
    text = repeat_normalize(text, num_repeats=3)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def predict_label(text, model, tokenizer):
    # 토큰화
    inputs = tokenizer(text, return_tensors="pt", padding="max_length", truncation=True, max_length=512)
    # 모델 예측
    outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=-1)
    pred = torch.argmax(probs, dim=1).item()

    label_map = {0: 'stock', 1: 'finance', 2: 'FAQ'}
    return label_map[pred]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('message')  # message
    parser.add_argument('user_id')  # user id

    args = parser.parse_args()
    
    # 입력된 메시지와 user_id 가져오기
    message = args.message
    user_id = args.user_id

    message = processe_text(message)
    classification = predict_label(message, model, tokenizer)
    print(json.dumps(cal.answer_link(classification, message)))

    # if classification == 'stock' :
    #     # 메시지에서 주식 관련 엔티티 추출
    #     print(entity_stock.stock_information(message))
    # else:
    #     data = {
    #         "예금": f"SELECT rp_date, rp_detail, rp_amount FROM tb_received_paid WHERE user_id = {user_id} AND rp_part = 1 AND rp_detail = '예금' AND rp_date = '2024-09-25';",
    #         "비교": f"SELECT rp_detail, SUM(rp_amount) AS Total_Amount FROM tb_received_paid WHERE user_id = {user_id} AND rp_part = 1 AND rp_detail = '예금' AND rp_date = '2024-09-25';"
    #     }

    #     # JSON 형식으로 출력 (f-string이 해석된 값을 반환)
    #     print(json.dumps(data, ensure_ascii=False))
    #     #print('http://localhost:3000/faq')

if __name__ == '__main__':
    main()