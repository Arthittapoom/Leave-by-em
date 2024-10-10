<template>
  <div class="user-details-container scrollable-content">
    <!-- User Information Section -->
    <div class="user-info">
      <div class="user-photo-section">
        <div class="user-photo">
          <!-- Placeholder for user photo -->
        </div>
        <p>รหัสพนักงาน {{ user.employeeId }}</p>
      </div>

      <div class="user-data-section">
        <div class="user-data">
          <label>ชื่อ-นามสกุล</label>
          <div class="data-box">{{ user.dataUser.name }}</div>
        </div>

        <div class="user-data">
          <label>เบอร์โทร</label>
          <div class="data-box">{{ user.dataUser.phone }}</div>
        </div>

        <div class="user-data">
          <label>ตำแหน่ง</label>
          <div class="data-box">{{ user.dataUser.position }}</div>
        </div>

        <div class="user-data">
          <label>แผนก</label>
          <div class="data-box">{{ user.dataUser.department }}</div>
        </div>
      </div>
    </div>

    <!-- Leave History Table Section -->
    <div class="leave-history-section">
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>ประเภทการลา</th>
            <th>วันที่ลาวันแรก</th>
            <th>วันที่ลาวันสุดท้าย</th>
            <th>เหตุผลที่ลา</th>
            <th>สถานะคำขอ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(leave, index) in paginatedLeaveHistory" :key="index">
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ leave.type }}</td>
            <td>{{ leave.startDate }} - {{ leave.startTime }}</td>
            <td>{{ leave.endDate }} - {{ leave.endTime }}</td>
            <td>{{ leave.reason }}</td>
            <td>
              <span :class="getStatusClass(leave.status)">
                {{ leave.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">ก่อนหน้า</button>
        <span>หน้า {{ currentPage }} จาก {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">ถัดไป</button>
      </div>
    </div>

    <!-- Back Button -->
    <button @click="goBack" class="back-btn">ย้อนกลับ</button>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      leaveHistory: [],
      currentPage: 1,
      itemsPerPage: 10, // จำนวนรายการต่อหน้า
    }
  },
  props: ['user'],
  computed: {
    paginatedLeaveHistory() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.leaveHistory.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.leaveHistory.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.getLeavesByLineId(this.user.dataUser.lineId);
  },
  methods: {
    async getLeavesByLineId(id) {
      try {
        // เรียก API ทั้งสองตัวพร้อมกัน
        const leaveRequest = axios.get(`${process.env.API_URL}/leave/getLeavesByLineId/${id}`);
        const leaveOutsideRequest = axios.get(`${process.env.API_URL}/LeaveOutside/getLeavesOutsideByLineId/${id}`);

        // รอให้ API ทั้งสองตัวทำงานเสร็จ
        const [leaveResponse, leaveOutsideResponse] = await Promise.all([leaveRequest, leaveOutsideRequest]);

        // รวมข้อมูลจากการลาในบริษัทและนอกบริษัท และจัดเรียงตามวันที่
        this.leaveHistory = [...leaveResponse.data, ...leaveOutsideResponse.data]
          .map(leave => ({ ...leave, showDetail: false }))
          .sort((a, b) => new Date(b.sendDate) - new Date(a.sendDate));
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    },
    goBack() {
      this.$emit('go-back-history');
    },
    getStatusClass(status) {
      if (status === 'รออนุมัติ') return 'pending';
      if (status === 'อนุมัติ') return 'approved';
      if (status === 'ไม่อนุมัติ') return 'rejected';
      if (status === 'ยกเลิกคำขอ') return 'cancelled';
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }
};
</script>


<style scoped>
/* Pagination Controls */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination button {
  padding: 5px 10px;
  margin: 0 5px;
  background-color: #8a6d9f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination span {
  margin: 0 10px;
}

/* Scrollable content */
.scrollable-content {
  width: 100%;
  height: 85vh;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 10px;
}

/* Custom scrollbar */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #ffffff;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: #ffffff;
}

/* User Details Container */
.user-details-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* User Info Section */
.user-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

/* User Photo Section */
.user-photo-section {
  text-align: center;
}

.user-photo {
  width: 120px;
  height: 120px;
  background-color: #8a6d9f;
  border-radius: 50%;
  margin-bottom: 10px;
}

.user-photo p {
  margin: 0;
  font-size: 16px;
}

/* User Data Section */
.user-data-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 75%;
}

.user-data {
  width: 48%;
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
}

.data-box {
  padding: 10px;
  background-color: #E0E0E0;
  border-radius: 5px;
  font-size: 16px;
  height: 40px;
}

/* Leave History Section */
.leave-history-section {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  color: #8a6d9f;
}

.pending {
  background-color: #fadcc0;
  color: #555;
  padding: 5px 10px;
  border-radius: 10px;
}

.approved {
  background-color: #C2F0E1;
  color: #17A789;
  padding: 5px 10px;
  border-radius: 10px;
}

.rejected {
  background-color: #F9D1D1;
  color: #D9534F;
  padding: 5px 10px;
  border-radius: 10px;
}

.cancelled {
  background-color: #e5e5e5;
  color: #555;
  padding: 5px 10px;
  border-radius: 20px;
}

/* Back Button */
.back-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #8a6d9f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>