<template>
    <div>
        <!-- แสดง UI โหลดเมื่อกำลังดึงข้อมูล -->
        <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- เมื่อโหลดข้อมูลเสร็จแล้ว -->
        <div v-else>
            <!-- Filtering and Search Section -->

            <!-- ส่วนกรองและค้นหา -->
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
                        <option value="ยกเลิกคำขอ">ยกเลิกคำขอ</option>
                    </select>
                    <select v-model="positionFilter" @change="filterTable">
                        <option value="">พนักงานที่ลางาน</option>
                        <option v-for="position in uniquePositions" :key="position" :value="position">
                            {{ position }}
                        </option>
                    </select>

                    <input type="text" v-model="searchQuery" placeholder="ค้นหา" @input="filterTable" />
                </div>
            </div>


            <!-- Table Section -->
            <LeaveDetails v-if="selectedUser" :user="selectedUser" @go-back="goBack" @save="saveUser" />
            <table v-if="!selectedUser">
                <!-- ตารางข้อมูล -->
                <!-- Table Section -->
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
                            <span :class="{
                                'approved': leave.status === 'อนุมัติ',
                                'rejected': leave.status === 'ไม่อนุมัติ',
                                'pending': leave.status === 'รออนุมัติ',
                                'cancelled': leave.status === 'ยกเลิกคำขอ'
                            }">
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
    </div>
</template>

<script>
import LeaveDetails from '../../components/MenuPages/Leave/LeaveDetails.vue';
import axios from 'axios';

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
            isLoading: false  // เก็บสถานะการโหลด
        };
    },
    computed: {
        uniquePositions() {
            const positions = this.leaveRequests.map(leave => leave.position);
            return [...new Set(positions)]; // ใช้ Set เพื่อให้ได้ข้อมูลที่ไม่ซ้ำกัน
        },
        filteredLeaveRequests() {
            return this.leaveRequests.filter(leave => {
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
            return this.filteredLeaveRequests.slice(start, start + this.itemsPerPage);
        },
        totalPages() {
            return Math.ceil(this.filteredLeaveRequests.length / this.itemsPerPage);
        }
    },
    mounted() {
        this.getLeaveDataByLineId();
    },
    methods: {
        async getLeaveDataByLineId() {
            this.isLoading = true;

            try {
                const [leaveResponse, leaveOutsideResponse] = await Promise.all([
                    axios.get(`${process.env.API_URL}/leave/getLeaves`),
                    axios.get(`${process.env.API_URL}/LeaveOutside/getLeavesOutside`)
                ]);

                const leaves = leaveResponse.data;
                const leavesOutside = leaveOutsideResponse.data;

                this.leaveRequests = await Promise.all([...leaves, ...leavesOutside].map(async leave => {
                    const userData = await this.getUserByLineId(leave.lineId);
                    const isOutsideLeave = leave.type === 'ออกปฏิบัติงานนอกสถานที่';

                    return {
                        id: leave._id,
                        leaveType: leave.type || 'ออกปฏิบัติงานนอกสถานที่',
                        leaveReason: leave.reason,
                        employeeId: userData ? userData.code : 'N/A',
                        fullName: userData ? userData.name : 'ไม่พบข้อมูล',
                        position: userData ? userData.position : 'ไม่พบข้อมูล',
                        startDate: leave.startDate,
                        startTime: leave.startTime,
                        endDate: leave.endDate,
                        endTime: leave.endTime,
                        status: leave.status || 'รออนุมัติ',
                        lineId: leave.lineId,
                        dataLeave: leave,
                        dataUser: userData,
                        sendDate: leave.sendDate || leave.createdAt, // ใช้ createdAt ในกรณีที่ไม่มี sendDate
                        workLocation: isOutsideLeave ? leave.workLocation : null,
                        vehicle: isOutsideLeave ? leave.vehicle : null,
                        vehicleNumber: isOutsideLeave ? leave.vehicleNumber : null,
                    };
                }));

                this.leaveRequests.sort((a, b) => new Date(b.sendDate) - new Date(a.sendDate));
            } catch (error) {
                console.log("Error fetching leave data:", error);
            } finally {
                this.isLoading = false;
            }
        },

        async getUserByLineId(lineId) {
            try {
                const response = await axios.get(`${process.env.API_URL}/users/getUserByLineId/${lineId}`);
                return response.data;
            } catch (error) {
                console.log("Error fetching user data:", error);
                return null;
            }
        },

        viewUser(user) {
            this.selectedUser = user; // ตั้งค่าผู้ใช้ที่ถูกเลือกเมื่อกดปุ่มดูรายละเอียด
        },
        goBack() {
            this.selectedUser = null; // กลับไปที่รายการหลังจากดูรายละเอียด
        },
        async saveUser(updatedUser) {
            const incrementLeave = async (lineId, apiField) => {
                try {
                    const userResponse = await axios.get(`${process.env.API_URL}/users/getUserByLineId/${lineId}`);
                    const currentLeaveCount = parseInt(userResponse.data[apiField]) || 0;
                    const updatedLeaveCount = currentLeaveCount + 1;

                    await axios.put(`${process.env.API_URL}/users/updateUserByLineId/${lineId}`, {
                        [apiField]: updatedLeaveCount
                    });
                } catch (error) {
                    console.error("Error updating leave count:", error);
                }
            };

            const sendLineNotification = (lineId, message) => {
                axios.post(`${process.env.API_URL}/lineApi/sendImage/${lineId}`, { message })
                    .then(() => console.log("Notification sent"))
                    .catch(error => console.log("Error sending notification:", error));
            };

            if (updatedUser.status === 'อนุมัติ') {
                switch (updatedUser.leaveType) {
                    case 'ลาป่วย':
                        await incrementLeave(updatedUser.lineId, 'totalSickLeave');
                        break;
                    case 'ลากิจ':
                        await incrementLeave(updatedUser.lineId, 'totalPersonalLeave');
                        break;
                    case 'ลาพักร้อน':
                        await incrementLeave(updatedUser.lineId, 'totalVacationLeave');
                        break;
                    case 'ลากิจพิเศษ':
                    case 'อุปสมบท':
                    case 'ลาคลอด':
                    case 'ลาไม่รับค่าจ้าง':
                        await incrementLeave(updatedUser.lineId, 'totalUnpaidLeave');
                        break;
                    default:
                        console.log('ไม่พบประเภทการลา');
                }
            }

            const apiUrl = updatedUser.leaveType === 'ออกปฏิบัติงานนอกสถานที่' 
                ? `${process.env.API_URL}/LeaveOutside/updateLeaveOutside/${updatedUser.id}` 
                : `${process.env.API_URL}/leave/updateLeave/${updatedUser.id}`;

            try {
                await axios.put(apiUrl, {
                    status: updatedUser.status,
                    reasonText: updatedUser.reasonText || null
                });

                alert('บันทึกสำเร็จ');
                sendLineNotification(updatedUser.lineId, updatedUser.status === 'อนุมัติ' ? 'อนุมัติ' : 'ไม่อนุมัติ');
                this.selectedUser = null; // ล้างข้อมูลผู้ใช้ที่เลือก
            } catch (error) {
                console.log("Error updating leave status:", error);
            }
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
        }
    }
};
</script>


<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100px;
    /* ปรับตามความต้องการ */
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #4f46e5;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

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
    background-color: #ffe39b;
    color: #555555;
    padding: 5px 10px;
    border-radius: 20px;
}

span.cancelled {
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
