<template>
    <div>

        <!-- Filtering and Search Section -->
        <div v-if="!selectedUser" class="filter-search">
            <div>
                แสดง
                <select class="mr-2" v-model="itemsPerPage" @change="filterTable">
                    <option v-for="num in [5, 10, 15, 20]" :key="num" :value="num">{{ num }}</option>
                </select>
                รายการ
            </div>
            <div>
                <select v-model="statusFilter" @change="filterTable">
                    <option value="">สถานะ</option>
                    <option value="อนุมัติ">อนุมัติ</option>
                    <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                    <option value="รออนุมัติ">รออนุมัติ</option>
                </select>
                <select v-model="positionFilter" @change="filterTable">
                    <option value="">พนักงานที่ลางาน</option>
                    <option value="Assistant PM">Assistant PM</option>
                    <option value="Manager">Manager</option>
                    <!-- Add other positions as needed -->
                </select>
                <input type="text" v-model="searchQuery" placeholder="ค้นหา" @input="filterTable" />
            </div>
        </div>

        <!-- Table Section -->
        <LeaveDetails v-if="selectedUser" :user="selectedUser" @go-back="goBack" @save="saveUser" />
        <table v-if="!selectedUser">

            <thead>
                <tr>
                    <th>ลำดับ</th>
                    <th>รหัสพนักงาน</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ตำแหน่ง</th>
                    <th>วันที่ลาวันแรก</th>
                    <th>เวลาเริ่มต้น</th>
                    <th>วันที่ลาวันสุดท้าย</th>
                    <th>เวลาสิ้นสุด</th>
                    <th>สถานะคำขอ</th>
                    <th>ปรับแต่ง</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(leave, index) in filteredLeaveRequests.slice(0, itemsPerPage)"
                    :key="leave.employeeId + index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ leave.employeeId }}</td>
                    <td>{{ leave.fullName }}</td>
                    <td>{{ leave.position }}</td>
                    <td>{{ leave.startDate }}</td>
                    <td>{{ leave.startTime }}</td>
                    <td>{{ leave.endDate }}</td>
                    <td>{{ leave.endTime }}</td>
                    <td>
                        <span
                            :class="{ 'approved': leave.status === 'อนุมัติ', 'rejected': leave.status === 'ไม่อนุมัติ', 'pending': leave.status === 'รออนุมัติ' }">
                            {{ leave.status }}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button @click="viewUser(leave)" class="view-btn">
                            <img class="icon" src="../../static/admin/admin/icon-1.png" alt="">
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import LeaveDetails from '../../components/MenuPages/Leave/LeaveDetails.vue';

export default {
    components: {
        LeaveDetails
    },
    data() {
        return {
            leaveRequests: [],
            selectedUser: null, // เก็บข้อมูลผู้ใช้ที่ถูกเลือก
            searchQuery: '',
            statusFilter: '',
            positionFilter: '',
            itemsPerPage: 10, // จำนวนรายการที่แสดงต่อหน้า
        };
    },
    computed: {
        filteredLeaveRequests() {
            return this.leaveRequests.filter((leave) => {
                const matchesStatus = this.statusFilter === '' || leave.status === this.statusFilter;
                const matchesPosition = this.positionFilter === '' || leave.position === this.positionFilter;
                const matchesSearchQuery =
                    leave.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    leave.employeeId.toLowerCase().includes(this.searchQuery.toLowerCase());
                return matchesStatus && matchesPosition && matchesSearchQuery;
            });
        },
    },
    mounted() {
        this.getLeave();
    },
    methods: {
        // ดึงข้อมูลผู้ใช้ลา
        getLeave() {
            const axios = require('axios');

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.API_URL + '/leave/getLeaves',
                headers: {}
            };

            axios.request(config)
                .then((response) => {
                    // สมมุติข้อมูลที่ได้รับ
                    this.leaveRequests = response.data.map(leave => ({
                        // employeeId: leave.lineId, // ใช้ lineId แทน employeeId
                        employeeId: "A123456",
                        fullName: leave.reason, // ใช้ reason แทน fullName (ต้องปรับตามข้อมูลจริง)
                        position: leave.type, // ใช้ type แทน position (ต้องปรับตามข้อมูลจริง)
                        startDate: leave.startDate,
                        startTime: leave.startTime,
                        endDate: leave.endDate,
                        endTime: leave.endTime,
                        status: leave.status || 'รออนุมัติ', // ถ้าไม่มี status ให้กำหนดเป็น 'รออนุมัติ'
                    }));

                    console.log(this.leaveRequests);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        viewUser(user) {
            this.selectedUser = user; // ตั้งค่าผู้ใช้ที่ถูกเลือกเมื่อกดปุ่มดูรายละเอียด
        },
        goBack() {
            this.selectedUser = null; // กลับไปที่รายการหลังจากดูรายละเอียด
        },
        saveUser(updatedUser) {
            // อัปเดตข้อมูลผู้ใช้ที่ถูกเลือก
            console.log('Updated user:', updatedUser);
        },
        filterTable() {
            // ฟังก์ชันกรองข้อมูลตาราง
        }
    }
};
</script>

<style scoped>
/* Table styling and buttons */
.icon {
    width: 18px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Arial', sans-serif;
}

th,
td {
    padding: 10px;
    text-align: left;
}

th {
    background-color: #ffffff;
    color: #5016a7;
}

tbody tr:hover {
    background-color: #f4e7fa;
}

.action-buttons {
    display: flex;
    gap: 5px;
}

button {
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}

.view-btn {
    background-color: #5CBCAB;
    color: white;
}

span.approved {
    background-color: #c2f0e1;
    color: #17a789;
    padding: 5px 10px;
    border-radius: 20px;
}

span.rejected {
    background-color: #f9d1d1;
    color: #d9534f;
    padding: 5px 10px;
    border-radius: 20px;
}

span.pending {
    background-color: #e5e5e5;
    color: #555;
    padding: 5px 10px;
    border-radius: 20px;
}

/* Filter and Search styling */
.filter-search {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-family: 'Arial', sans-serif;
}

.filter-search div {
    display: flex;
    align-items: center;
}

select,
input {
    margin-left: 10px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

input[type="text"] {
    width: 150px;
}
</style>
