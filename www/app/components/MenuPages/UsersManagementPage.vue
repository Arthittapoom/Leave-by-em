<template>
    <div class="scrollable-content">
        <!-- Filtering and Search Section -->
        <div v-if="!selectedUser" class="filter-search">
            <div>

                <!-- <select class="mr-2" v-model="itemsPerPage" @change="filterTable">
                    <option v-for="num in [5, 10, 15, 20, 25]" :key="num" :value="num">{{ num }}</option>
                </select> -->

                <div class="custom-pagination">
                    <!-- <p>หน้า</p> -->
                    <button @click="prevPage" :disabled="currentPage === 1">◀</button>
                    <button v-for="page in totalPages" :key="page" @click="changePage(page)"
                        :class="{ 'active-page': page === currentPage }">
                        {{ page }}
                    </button>
                    <button @click="nextPage" :disabled="currentPage === totalPages">▶</button>
                </div>


                <!-- รายการ -->
            </div>
            <div>
                <select v-model="statusFilter" @change="filterTable">
                    <option value="">สถานะ</option>
                    <option value="สำนักงานใหญ่">สำนักงานใหญ่</option>
                    <option value="สาขา">สาขา</option>
                    <!-- เพิ่มสถานที่ปฏิบัติงานเพิ่มเติม -->
                </select>
                <select v-model="positionFilter" @change="filterTable">
                    <option value="">พนักงานที่ลางาน</option>
                    <option value="UX/UI Designer">UX/UI Designer</option>
                    <!-- เพิ่มตำแหน่งอื่น ๆ ตามต้องการ -->
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
                    <!-- <th>ชื่อผู้ใช้</th> -->
                    <th>ชื่อ-นามสกุล</th>
                    <th>ตำแหน่ง</th>
                    <th>สถานะไลน์</th>
                    <th>สถานที่ปฏิบัติงาน</th>
                    <th>ปรับแต่ง</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(user, index) in paginatedUsers" :key="index">

                    <td>{{ index + 1 }}</td>
                    <td>{{ user.employeeId }}</td>
                    <!-- <td>{{ user.username }}</td> -->
                    <td>{{ user.fullName }}</td>
                    <td>{{ user.position }}</td>
                    <td>
                        <span v-if="user.lineId !== 'null'" class="approved">
                            เชื่อมต่อสำเร็จ
                        </span>
                        <span v-if="user.lineId === 'null'" class="rejected">
                            ไม่มีการเชื่อมต่อ
                        </span>
                    </td>
                    <td>{{ user.workLocation }}</td>
                    <td class="action-buttons">
                        <button @click="viewUser(user)" class="view-btn">
                            <img class="icon" src="../../static/admin/admin/icon-1.png" alt="view">
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import LeaveDetails from '../../components/MenuPages/User/UserDetails.vue';
import axios from 'axios';
export default {
    components: {
        LeaveDetails
    },
    data() {
        return {
            users: [],
            selectedUser: null,
            searchQuery: '',
            statusFilter: '',
            positionFilter: '',
            itemsPerPage: 10, // จำนวนรายการที่แสดงต่อหน้า
            currentPage: 1,  // Initialize to page 1

        };
    },
    computed: {
        filteredUsers() {
            return this.users.filter((user) => {
                const matchesStatus = this.statusFilter === '' || user.workLocation === this.statusFilter;
                const matchesPosition = this.positionFilter === '' || user.position === this.positionFilter;
                const matchesSearchQuery =
                    user.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    user.employeeId.toLowerCase().includes(this.searchQuery.toLowerCase());
                return matchesStatus && matchesPosition && matchesSearchQuery;
            });
        },
        paginatedUsers() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredUsers.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        }

    },
    methods: {
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
        viewUser(user) {
            this.selectedUser = user; // เลือกผู้ใช้ที่ต้องการดูรายละเอียด
        },
        goBack() {
            this.selectedUser = null; // ย้อนกลับไปยังรายการผู้ใช้
        },
        saveUser(updatedUser) {
            console.log('Updated user:', updatedUser);
            const index = this.users.findIndex(user => user.employeeId === updatedUser.employeeId);
            if (index !== -1) {
                this.users.splice(index, 1, updatedUser); // อัพเดตข้อมูลผู้ใช้ในตาราง
            }
            this.selectedUser = null; // กลับไปที่ตารางหลังจากบันทึก
        },
        filterTable() {
            // ฟังก์ชันกรองข้อมูลตาราง
        },
        getUsers() {
            let config = {
                method: 'get',
                url: `${process.env.API_URL}/users/getUsers`,
            };

            axios(config)
                .then((response) => {
                    // console.log(response.data);

                    // Ensure this.users is initialized as an empty array or it will accumulate data
                    this.users = [];

                    // Iterate over response data and push objects into this.users
                    for (let i = 0; i < response.data.length; i++) {
                        this.users.push({
                            id: response.data[i]._id,
                            employeeId: response.data[i].code,  // รหัสพนักงาน
                            username: response.data[i].code,    // รหัสพนักงาน as username
                            fullName: response.data[i].name,    // ชื่อ - นามสกุล
                            nickname: response.data[i].nickname, // ชื่อเล่น
                            lineId: response.data[i].lineId,    // Line ID
                            phone: response.data[i].phone,      // เบอร์โทร
                            department: response.data[i].department, // แผนก
                            division: response.data[i].division, // ฝ่าย
                            position: response.data[i].position, // ตำแหน่ง
                            employeeType: response.data[i].employeeType, // ประเภทพนักงาน
                            workLocation: response.data[i].workplace, // สถานที่ปฏิบัติงาน
                            startDate: response.data[i].startDate,  // วันที่เริ่มงาน
                            passedDate: response.data[i].passedDate, // วันที่ผ่านโปร
                            diffDays_days: response.data[i].diffDays_days, // อายุงาน (วัน)
                            diffDays_months: response.data[i].diffDays_months, // อายุงาน (เดือน)
                            diffDays_years: response.data[i].diffDays_years, // อายุงาน (ปี)
                            initialLeaveApprover: response.data[i].initialLeaveApprover, // ผู้อนุมัติการลาขั้นต้น
                            finalLeaveApprover: response.data[i].finalLeaveApprover,  // ผู้อนุมัติสูงสุด
                            diffDays_days_exl: response.data[i].diffDays_days_exl,  // จำนวนวันทำงาน จาก Excel
                            sickLeave_days: response.data[i].sickLeave_days,  // ป่วย/วัน
                            sickLeave_hours: response.data[i].sickLeave_hours,  // ป่วย/ชม.
                            totalSickLeave: response.data[i].totalSickLeave,  // รวมวันลาป่วย
                            remainingSickLeave: response.data[i].remainingSickLeave,  // สิทธิ์คงเหลือวันลาป่วย
                            personalLeave_days: response.data[i].personalLeave_days,  // กิจ/วัน
                            personalLeave_hours: response.data[i].personalLeave_hours,  // กิจ/ชม.
                            totalPersonalLeave: response.data[i].totalPersonalLeave,  // รวมวันลากิจ
                            remainingPersonalLeave: response.data[i].remainingPersonalLeave,  // สิทธิ์คงเหลือวันลากิจ
                            vacationLeave_days: response.data[i].vacationLeave_days,  // พักร้อน/วัน
                            vacationLeave_hours: response.data[i].vacationLeave_hours,  // พักร้อน/ชม.
                            totalVacationLeave: response.data[i].totalVacationLeave,  // รวมพักร้อน
                            remainingVacationLeave: response.data[i].remainingVacationLeave,  // สิทธิ์คงเหลือวันพักร้อน
                            grantedVacationLeave: response.data[i].grantedVacationLeave,  // สิทธิ์พักร้อนที่ได้
                            unpaidLeave_days: response.data[i].unpaidLeave_days,  // ไม่รับค่าจ้าง/วัน
                            unpaidLeave_hours: response.data[i].unpaidLeave_hours,  // ไม่รับค่าจ้าง/ชม.
                            totalUnpaidLeave: response.data[i].totalUnpaidLeave,  // รวมไม่รับค่าจ้าง
                            specialPersonalLeave: response.data[i].specialPersonalLeave,  // ลากิจพิเศษ
                            ordinationLeave: response.data[i].ordinationLeave,  // ลาเพื่ออุปสมบท
                            maternityLeave: response.data[i].maternityLeave,  // ลาคลอด
                            workInjuryLeave_days: response.data[i].workInjuryLeave_days,  // ลาป่วย (เนื่องจากบาดเจ็บในงาน)/วัน
                        });

                    }

                    console.log(this.users)
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    },
    mounted() {
        this.getUsers();
    },
};
</script>

<style scoped>
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

/* Table styling */
.icon {
    width: 18px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Arial', sans-serif;
    border-spacing: 0;
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

.view-btn img {
    width: 16px;
    height: 16px;
}

/* Filter and Search styling */
.filter-search {
    display: flex;
    justify-content: space-between;
    /* margin-bottom: 20px; */
    margin-top: -10px;
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

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    /* margin-top: 20px; */
}

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
    /* padding: 10px 15px; */
    padding-bottom: 20px;
    /* margin-right: 10px; */
    /* margin-left: 10px; */
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