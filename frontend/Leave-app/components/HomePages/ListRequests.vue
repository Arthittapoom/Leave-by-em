<template>
    <div class="request-list">
      <h3>รายการคำขอทั้งหมด</h3>
      <div class="request-item" v-for="(request, index) in requests" :key="index">
        <div class="request-icon">
          <div class="icon-number">{{ request.id }}</div>
        </div>
        <div class="request-details">
          <div class="request-name">{{ request.name }}</div>
          <div class="request-date-time">{{ request.date }} | {{ request.time }}</div>
        </div>
        <div class="request-reason">{{ request.reason }}</div>
        <button class="details-button" @click="openModal(request)">รายละเอียด</button>
      </div>
  
      <!-- Modal -->
      <div v-if="selectedRequest" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h3>รายละเอียดคำขอ</h3>
          <p><strong>ชื่อ-นามสกุล:</strong> {{ selectedRequest.name }}</p>
          <p><strong>รหัสพนักงาน:</strong> WM64007H</p>
          <p><strong>ตำแหน่ง:</strong> Human Resource Officer</p>
          <p><strong>สังกัด:</strong> Workmotion</p>
          <p><strong>ประเภทพนักงาน:</strong> พนักงานรายเดือน</p>
          <p><strong>ฝ่าย:</strong> Human Resource</p>
          <p><strong>สถานที่ปฏิบัติงาน:</strong> BKK</p>
          <p><strong>อายุงาน:</strong> 000-000000</p>
          <p><strong>เบอร์โทรศัพท์:</strong> 000-00000000</p>
          <p><strong>ประเภทการลา/เหตุผลการลา:</strong> {{ selectedRequest.reason }}</p>
          <p><strong>วัน/เดือน/ปี ที่ต้องการลา:</strong> XX/XX/XXXX - XX/XX/XXXX</p>
          <p><strong>เวลา ที่ต้องการลา:</strong> 22:00 - 23:00</p>
          <div class="approval">
            <label><input type="radio" name="approval" value="approved" /> อนุมัติ</label>
            <label><input type="radio" name="approval" value="not-approved" /> ไม่อนุมัติ</label>
          </div>
          <label for="remark">หมายเหตุ:</label>
          <textarea id="remark" rows="4"></textarea>
          <button class="submit-button">ยืนยัน</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        requests: [
          {
            id: 1,
            name: "นาย กานต์ธนิต ทรัพย์เขต",
            date: "16 ส.ค 67",
            time: "06:35 น.",
            reason: "ลาป่วย / เป็นไข้หวัดใหญ่"
          },
          {
            id: 1,
            name: "นาย กานต์ธนิต ทรัพย์เขต",
            date: "16 ส.ค 67",
            time: "08:52 น.",
            reason: "ลากิจ / พาแมวไปทำหมัน"
          }
        ],
        selectedRequest: null
      };
    },
    methods: {
      openModal(request) {
        this.selectedRequest = request;
      },
      closeModal() {
        this.selectedRequest = null;
      }
    }
  };
  </script>
  
  <style scoped>
  .request-list {
    padding: 20px;
  }
  
  .request-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding: 10px 0;
  }
  
  .request-icon {
    margin-right: 10px;
  }
  
  .icon-number {
    width: 30px;
    height: 30px;
    background-color: red;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
  }
  
  .request-details {
    flex-grow: 1;
  }
  
  .request-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .request-date-time {
    color: #999;
    font-size: 14px;
  }
  
  .request-reason {
    margin-right: 20px;
    font-size: 14px;
  }
  
  .details-button {
    background-color: #ffeb3b;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .details-button:hover {
    background-color: #fdd835;
  }
  
  /* Modal Styles */
  .modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .modal-content {
    background-color: #fefefe;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
    border-radius: 10px;
  }
  
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
  
  .approval {
    display: flex;
    margin-top: 10px;
  }
  
  .approval label {
    margin-right: 10px;
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  
  .submit-button {
    margin-top: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #6200ea;
    color: white;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
  }
  
  .submit-button:hover {
    background-color: #3700b3;
  }
  </style>
  