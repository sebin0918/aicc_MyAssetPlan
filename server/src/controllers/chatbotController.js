const path = require('path');  // 경로 조작을 위한 모듈
const pool = require('../config/database'); // 데이터베이스 연결 모듈 가져오기
const { spawn } = require('child_process');

// GET 처리 함수
const getChatList = async (req, res) => {
  const user_id = req.session.userId; // 세션에서 userId 가져오기
  if (!user_id) {
      console.error('에러 코드: AUTH_001 - 인증되지 않은 접근 시도');
      return res.status(401).json({ error: '인증되지 않은 접근입니다.', code: 'AUTH_001' }); // 사용자 인증 실패
  }
  try {
      const result = await pool.query(`
        SELECT cb_id, user_id, cb_text, cb_division
        FROM tb_chat_bot
        WHERE user_id = ?
        ORDER BY cb_id DESC;`, [user_id]);

      const chatList = result.map(row => ({
          id: row.cb_id,  // 프론트에서 사용할 cb_id 추가
          text: row.cb_text,
          type: row.cb_division === 0 ? 'bot' : 'user'
      }));

      res.json(chatList);
  } catch (error) {
      console.error('에러 코드: DB_001 - 채팅 기록 가져오기 실패:', error);
      res.status(500).json({ error: '서버 내부 오류', code: 'DB_001' });
  }
};

// POST 처리 함수
const postChatbotData = async (req, res) => {
  const { message } = req.body;
  const user_id = req.session.userId;
  console.log("챗봇메세지:", message)

  if (!user_id) {
    console.error('에러 코드: AUTH_002 - 인증되지 않은 접근 시도');
    return res.status(401).json({ error: '로그인 후 이용해 주세요.', code: 'AUTH_002' });
  }

  try {
    // 첫 번째 INSERT: 기본 데이터 저장
    await pool.query(`
      INSERT INTO tb_chat_bot (user_id, cb_text, cb_query, cb_division)
      VALUES (?, ?, ?, ?);
    `, [user_id, message, null, 1]);

    // Python 스크립트 경로 설정
    const returnQueryPath = path.join(__dirname, '../algorithm/script/return_query.py');
    
    // Python 실행
    const return_query = spawn('conda', ['run', '-n', 'test_pytorch', 'python', returnQueryPath, message, user_id]);
    console.log("리턴쿼리 실행 완료")

    let return_query_data = '';
    let return_query_error = '';

    // Python 출력 수신
    return_query.stdout.on('data', (data) => {
      return_query_data += data.toString();
      console.log('Python Output:', return_query_data);
    });

    // Python 에러 출력 수신
    return_query.stderr.on('data', (error) => {
      return_query_error += error.toString();
      console.error('에러 코드: PY_001 - Python 에러:', return_query_error);
    });

    // Python 스크립트 종료 후 처리
    return_query.on('close', async (code) => {
      if (return_query_error.trim() !== '') {
        console.error('에러 코드: PY_002 - Python 실행 실패');
        return res.status(500).json({ error: 'Python 스크립트 실행 실패', code: 'PY_002' });
      }

      try {
        const parsedData = JSON.parse(return_query_data);
        console.log("!!!!!", parsedData);
        const queryResults = [];
        const executedQueries = [];
        let finalResult = '';  // 최종 문장 결과를 저장할 변수

      
        for (const [key, query] of Object.entries(parsedData)) {
          console.log(`쿼리 실행 중: ${key}`);
          // !!!!! 여기부터 if로 넘어가게

          // // 모든 값에서 백슬래시 제거
          // const cleanedQuery = query.replace(/\\/g, '');

          // // 데이터베이스 쿼리 실행
          // const result = await pool.query(cleanedQuery);
          // if (!result[0]) {
          //   console.error('에러 코드: DB_002 - 잘못된 SQL 쿼리');
          //   return res.status(400).json({ data: '잘못된 입력입니다. 다시 시도해주세요.', code: 'DB_002' });
          // }
          
          // // 쿼리 결과와 실행된 쿼리를 저장
          // queryResults.push({ key, result: result[0] });
          // executedQueries.push(cleanedQuery);

          // 각 쿼리에 해당하는 key를 sentence_key로 전달
          // const sentence_data = JSON.stringify(result[0]); // 결과를 JSON으로 직렬화
          
          // 여기까지 넘어가게
          const sentence_data = query
          const sentence_key = key;  // 각 쿼리 키를 sentence_key로 사용

          // Python 문장 생성 스크립트 실행
          const sentenceCreationPath = path.join(__dirname, '../algorithm/script/sentence_creation.py');
          const sentence_creation = spawn('conda', ['run', '-n', 'test_pytorch', 'python', sentenceCreationPath, sentence_data, sentence_key]);

          let sentence_creation_data = '';
          let sentence_creation_error = '';

          // Python 출력 수신
          sentence_creation.stdout.on('data', (data) => {
            sentence_creation_data += data.toString();
            console.log('생성된 문장 데이터:', sentence_creation_data);
          });

          // Python 에러 수신
          sentence_creation.stderr.on('data', (error) => {
            sentence_creation_error += error.toString();
            console.error('에러 코드: PY_003 - 문장 생성 Python 스크립트 에러:', sentence_creation_error);
          });

          // Python 스크립트 종료 후 처리
          sentence_creation.on('close', async (code) => {
            if (sentence_creation_error.trim() !== '') {
              console.error('에러 코드: PY_004 - 문장 생성 실패');
              return res.status(500).json({ error: '문장 생성 실패', code: 'PY_004' });
            }
            console.log()
            // 생성된 문장을 최종 결과에 추가하고 '\n\n'을 삽입
            finalResult += sentence_creation_data + '\n\n';
            
            // 모든 쿼리 처리 후에 데이터베이스에 한 번만 저장
            if (key === Object.keys(parsedData).pop()) {
              // 두 번째 INSERT: 최종 결과 저장
              await pool.query(`
                INSERT INTO tb_chat_bot (user_id, cb_text, cb_query, cb_division)
                VALUES (?, ?, ?, ?);
              `, [user_id, finalResult.trim(), JSON.stringify(executedQueries), 0]); // finalResult에서 마지막 \n\n 제거

               // 새로 저장된 id 가져오기
              const newChatId_select = await pool.query('\
                SELECT cb_id \
                FROM tb_chat_bot \
                WHERE user_id=1 AND cb_division=0 \
                ORDER BY cb_id DESC \
                LIMIT 1;\
                ')
              const newChatId = newChatId_select[0].cb_id
              // 최종 응답 전송
              res.json({ data: finalResult.trim(), newChatId });
            }
          });
        }
      } catch (error) {
        console.error('에러 코드: PROC_001 - 챗봇 데이터 처리 중 에러:', error);
        res.status(500).json({ error: '서버 내부 오류', code: 'PROC_001' });
      }
    });
  } catch (error) {
    console.error('에러 코드: DB_003 - 챗봇 데이터 처리 중 데이터베이스 에러:', error);
    res.status(500).json({ error: '서버 내부 오류', code: 'DB_003' });
  }
};

const getChatDetail = async (req, res) => {
  const { chatId } = req.params;  // URL에서 chatId 추출
  try {
    const result = await pool.query('SELECT cb_text FROM tb_chat_bot WHERE cb_id = ?', [chatId]);
    if (result.length > 0) {
      res.json(result[0]);  // 성공적으로 데이터 반환
      
    } else {
      res.status(404).json({ error: 'Chat not found' });
    }
  } catch (error) {
    console.error('DB 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
};

module.exports = {
  postChatbotData,
  getChatList,
  getChatDetail,
};