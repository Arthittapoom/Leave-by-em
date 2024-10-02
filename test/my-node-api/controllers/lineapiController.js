const axios = require('axios');
const lineAccessToken = 'bZMOg6OHWjZkeBUfcgoAH8f1XSDMPwgWBDQpXZanWwW1kYqcXjfRtOlWfmEVJYA6NsvQ69NBH7E4tlEDSQLj0oy3kLSZQlZco5nbbnkJT9ds7OdfXHUMBV7+uG8gx4Z5m9xgjnqxWhMoX1l80yqsgQdB04t89/1O/w1cDnyilFU=';
// ฟังก์ชันจัดการ Webhook สำหรับ LINE
exports.handleWebhook = async (req, res) => {
    const events = req.body.events;

    console.log(events);

    // ตรวจสอบว่าได้รับ event หรือไม่
    if (events && events.length > 0) {
        events.forEach(event => {
            // ตรวจสอบว่าประเภทของ event เป็นข้อความหรือไม่
            if (event.type === 'message' && event.message.type === 'text') {
                const replyToken = event.replyToken;
                const userMessage = event.message.text;
                const groupId = event.source.groupId;
                const userId = event.source.userId;

                const eventdata = JSON.stringify(event, null, 2);

                if (userMessage === 'สั่งออเดอร์') {
                    replyMessage(replyToken, 'เข้าเว็บไซต์สั่ง https://chatgpt.com/');
                } else if (userMessage === 'data') {
                    replyMessage(replyToken, `Group ID: ${groupId}\nUser ID: ${userId}\n${eventdata}`);
                } else {
                    replyMessage(replyToken, `You said: ${userMessage}`);
                }
            }

            // ตรวจสอบว่าเป็น event ประเภท join หรือไม่
            if (event.type === 'follow') {
                const userId = event.source.userId; // ดึง userId ออกมา
                // const data = event.source

                // console.log(`data: ${data}`);
                console.log(`User ID joined: ${userId}`); // แสดง userId ในคอนโซล
            }
        });
    }

    // ตอบกลับ HTTP 200 เพื่อยืนยันว่าได้รับ Webhook แล้ว
    res.sendStatus(200);
};


// ฟังก์ชันส่งข้อความกลับไปยัง LINE
const replyMessage = (replyToken, message) => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lineAccessToken}`,
    };

    const payload = {
        replyToken: replyToken,
        messages: [
            {
                type: 'text',
                text: message,
            },
        ],
    };

    axios
        .post('https://api.line.me/v2/bot/message/reply', payload, { headers })
        .then(() => {
            console.log('Message sent successfully');
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
};

// ฟังก์ชันส่งข้อความไปยัง LINE โดยใช้ userId
exports.sendText = async (req, res) => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lineAccessToken}`,
    };

    const payload = {
        to: 'U4443eee1df72f2f36e6b18c474306e06', // เปลี่ยนเป็น userId ที่คุณต้องการส่งข้อความไป
        // to: 'U46a90008741d5fa0bfc4230b26d78879', // เปลี่ยนเป็น userId ที่คุณต้องการส่งข้อความไป
        messages: [
            // ส่ง png
            {
                type: 'image',
                originalContentUrl: 'https://img2.pic.in.th/pic/-114a813f82c500e64.png',
                previewImageUrl: 'https://img2.pic.in.th/pic/-114a813f82c500e64.png',
            },
            // ส่ง text
            { "type": "template", "altText": "this is a buttons template", "template": { "type": "buttons", "thumbnailImageUrl": "https://img2.pic.in.th/pic/-4a0fc4d5955b244a1.png", "imageAspectRatio": "rectangle", "imageSize": "cover", "imageBackgroundColor": "#FFFFFF", "title": "               อนุมัติการลา      ", "text": "            มีคำขอการลาเพิ่ม", "actions": [{ "type": "uri", "label": "ดูคำขอใหม่", "uri": "https://chatgpt.com/c/66e7aa73-7e10-800a-a776-c0f359fed3b3" }] } }
        ],
    };

    try {
        const response = await axios.post('https://api.line.me/v2/bot/message/push', payload, { headers });
        res.status(200).send({ message: 'Message sent successfully', data: response.data });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ message: 'Error sending message', error: error.message });
    }
};

//ส่งรูปภาพ ไป line ด้วย idline

exports.sendImage = async (req, res) => {
    const lineID = req.params.lineId;
    const message = req.body.message;

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lineAccessToken}`,
    };

    let payload = null;

    if (message === 'รออนุมัติ') {
        payload = {
            to: lineID,
            messages: [
                {
                    type: 'image',
                    originalContentUrl: 'https://img2.pic.in.th/pic/-114a813f82c500e64.png',
                    previewImageUrl: 'https://img2.pic.in.th/pic/-114a813f82c500e64.png',
                },
            ],
        };
    } else if (message === 'อนุมัติ') {
        payload = {
            to: lineID,
            messages: [
                {
                    type: 'image',
                    originalContentUrl: 'https://img2.pic.in.th/pic/-25faa8a2f822cc6ee.png',
                    previewImageUrl: 'https://img2.pic.in.th/pic/-25faa8a2f822cc6ee.png',
                },
            ],
        };
    } else if (message === 'ไม่อนุมัติ') {
        payload = {
            to: lineID,
            messages: [
                {
                    type: 'image',
                    originalContentUrl: 'https://img5.pic.in.th/file/secure-sv1/34b86919a2bfbd6cf.png',
                    previewImageUrl: 'https://img5.pic.in.th/file/secure-sv1/34b86919a2bfbd6cf.png',
                },
            ],
        };
    } else if (message === 'ยกเลิกคำขอ') {
        payload = {
            to: lineID,
            messages: [
                {
                    type: 'image',
                    originalContentUrl: 'https://img5.pic.in.th/file/secure-sv1/-3ed33aa5bb064eaf9.png',
                    previewImageUrl: 'https://img5.pic.in.th/file/secure-sv1/-3ed33aa5bb064eaf9.png',
                },
            ],
        };
    } else if (message === 'มีคำขอใหม่') {
        payload = {
            to: lineID,
            messages: [
                {  "type": "template",  
                    "altText": "this is a buttons template",  
                    "template": 
                    {
                        "type": "buttons",    
                        "thumbnailImageUrl": "https://img2.pic.in.th/pic/-4a0fc4d5955b244a1.png",
                        "imageAspectRatio": "rectangle",
                        "imageSize": "cover",    "imageBackgroundColor": "#FFFFFF",
                        "title": "       อนุมัติการลา      ",    
                        "text": "       มีคำขอการลาเพิ่ม   ",    
                        "actions": 
                        [
                            {
                                "type": "uri",        
                                "label": "ดูคำขอใหม่",
                                "uri": "https://liff.line.me/2006404318-E15PmnbO"
                            }
                        ]  
                    }
                }
            ],
        };
    }

    if (payload) {
        try {
            const response = await axios.post('https://api.line.me/v2/bot/message/push', payload, { headers });
            res.status(200).send({ message: 'Message sent successfully', data: response.data });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).send({ message: 'Error sending message', error: error.message });
        }
    } else {
        res.status(400).send({ message: 'Invalid message type' });
    }
};
