<template>
    <div>
        <!-- Filtering and Search Section -->
        <div v-if="!selectedUser" class="filter-search">
            <div>
                <div class="custom-pagination">
                    <!-- ปรับปรุงให้คล้ายกับ pagination -->
                    <button @click="prevPage" :disabled="currentPage === 1">◀</button>
                    <button v-for="page in totalPages" :key="page" @click="changePage(page)"
                        :class="{ 'active-page': page === currentPage }">
                        {{ page }}
                    </button>
                    <button @click="nextPage" :disabled="currentPage === totalPages">▶</button>
                </div>
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
                <tr v-for="(leave, index) in paginatedLeaveRequests" :key="leave.employeeId + index">
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
            currentPage: 1,  // Initialize to page 1
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
        paginatedLeaveRequests() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredLeaveRequests.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredLeaveRequests.length / this.itemsPerPage);
        }
    },
    mounted() {
        this.getLeave();
    },
    methods: {
        async getLeave() {
            const axios = require('axios');

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.API_URL + '/leave/getLeaves',
                headers: {}
            };

            try {
                const response = await axios.request(config);
                this.leaveRequests = await Promise.all(response.data.map(async leave => {
                    const userData = await this.getUserByLineId(leave.lineId);
                    return {
                        id: leave._id,
                        leaveType: leave.type,
                        leaveReason: leave.reason,
                        employeeId: userData.code,
                        fullName: userData.name,
                        position: userData.position,
                        startDate: leave.startDate,
                        startTime: leave.startTime,
                        endDate: leave.endDate,
                        endTime: leave.endTime,
                        status: leave.status || 'รออนุมัติ',
                        lineId: leave.lineId,
                        dataUser: userData  // นำข้อมูล userData ที่ดึงมาได้มาประกอบ
                    };
                }));
            } catch (error) {
                console.log(error);
            }
        },

        async getUserByLineId(lineId) {
            const axios = require('axios');

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.API_URL + '/users/getUserByLineId/' + lineId,
                headers: {}
            };

            try {
                const response = await axios.request(config);
                return response.data;
            } catch (error) {
                console.log(error);
                return null;
            }
        },

        viewUser(user) {
            this.selectedUser = user; // ตั้งค่าผู้ใช้ที่ถูกเลือกเมื่อกดปุ่มดูรายละเอียด
        },
        goBack() {
            this.selectedUser = null; // กลับไปที่รายการหลังจากดูรายละเอียด
        },
        saveUser(updatedUser) {
            // อัปเดตข้อมูลผู้ใช้ที่ถูกเลือก

            // console.log('Updated user:', updatedUser);

            const axios = require('axios');
            let data = JSON.stringify({
                "status": updatedUser.status,
                "reasonText": updatedUser.reasonText || null
            });

            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: process.env.API_URL + '/leave/updateLeave/' + updatedUser.id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios.request(config)
                .then((response) => {
                    // console.log(JSON.stringify(response.data));
                    alert('บันทึกสําเร็จ');
                    this.selectedUser = null;

                })
                .catch((error) => {
                    console.log(error);
                });

        },
        filterTable() {
            // ฟังก์ชันกรองข้อมูลตาราง
        },
        changePage(page) {
            this.currentPage = page;
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
        },
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

/* Custom pagination styling */
.custom-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
}

.custom-pagination button.active-page {
    background-color: #6f42c1;
    color: white;
}

.custom-pagination button {
    background-color: white;
    border: 1px solid #ddd;
    color: #333;
    cursor: pointer;
    height: 30px;
    width: 30px;
}

.custom-pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.custom-pagination button.active-page {
    background-color: #5a2d9c;
    color: white;
}
</style>
