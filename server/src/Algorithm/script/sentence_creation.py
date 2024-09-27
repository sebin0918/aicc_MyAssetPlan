import argparse
import json
import sys

# 인코딩 문제 해결
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# def sample_sentence(data) :
#   return print(f"index : {data['user_id']} | \n이메일 : {data['uk_email']} | \n패스워드 : {data['uk_password']}")

# def link_stock_sentence(data):
#     link = 'http://localhost:3000/stockchart'
#     return link

# def link_stockPredic_sentence(data):
#     link = 'http://localhost:3000/stockprediction'
#     return link

# def link_househole_sentence(data):
#     link = "http://localhost:3000/household"
#     return link

# def link_myasset_sentence(data):
#     link = "http://localhost:3000/myassetplaner"
#     return link

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('sentence_data')  # 문장에 필요한 데이터 
    parser.add_argument('sentence_key')   # 문장을 판단할 키워드
    args = parser.parse_args()

    sentence_data = args.sentence_data
    keyword = args.sentence_key
    # print("문장데이터:", sentence_data, "키워드:", keyword)

    # 전달받은 JSON 데이터를 파싱
    try:
        if keyword == '예외':
            print(f'"{sentence_data}" 오류가 발생하였습니다.\n올바른 형식으로 다시 질문해 주세요.')
        else:
            # data = json.loads(sentence_data)
            guidance = f'문의 주신 "{keyword}" 내용은 아래 링크에서 확인 하세요:\n'
            data = guidance + sentence_data
            print(data)
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")
        return

    # SQL 쿼리 생성
    # if keyword == '주가' or keyword == '증시' or keyword == 'PER' or keyword == 'PBR' or keyword == 'ROE' or keyword == 'MC' or keyword == '경제지표':
    #     link_stock_sentence(data)
    # elif keyword == '예상':
    #     link_stockPredic_sentence(data)
    # elif keyword == 'EXPENDITURE' or keyword == 'INCOME' or keyword == 'DEPOSIT_SAVINGS' or keyword == 'TRANSACTION' or keyword == 'ALL':
    #     link_househole_sentence(data)
    # elif keyword == 'BUDGET' or keyword == 'LOAN' or keyword == 'ASSET' or keyword == 'STOCK' or keyword == 'buy' or keyword == 'sell':
    #     link_myasset_sentence(data)


if __name__ == '__main__':
    main()
