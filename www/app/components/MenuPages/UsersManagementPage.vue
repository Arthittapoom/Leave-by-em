<template>
    <div class="scrollable-content">

        <!-- แสดง UI โหลดเมื่อกำลังดึงข้อมูล -->
        <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- เมื่อโหลดข้อมูลเสร็จแล้ว -->
        <div v-else>
            <!-- Filtering and Search Section -->
            <!-- ส่วนกรองและค้นหา -->

            <div v-if="!selectedUser" class="filter-search">
                <div>
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
                <!-- <button class="btn-export" @click="exportData()">export</button> -->
                <!-- eneratePDF -->
                <!-- <button class="btn-export" @click="generatePDF()">PDF</button> -->

                <div>
                    <!-- ตัวกรองตามสถานที่ปฏิบัติงาน -->
                    <select v-model="statusFilter" @change="filterTable">
                        <option value="">สถานะ</option>
                        <option v-for="location in uniqueLocations" :key="location" :value="location">
                            {{ location === 'null' ? 'ไม่มีการเชื่อมต่อ' : 'เชื่อมต่อสำเร็จ' }}
                        </option>
                    </select>

                    <!-- ตัวกรองตามตำแหน่งงาน -->
                    <select v-model="positionFilter" @change="filterTable">
                        <option value="">พนักงานที่ลางาน</option>
                        <option v-for="position in uniquePositions" :key="position" :value="position">
                            {{ position }}
                        </option>
                    </select>

                    <input type="text" v-model="searchQuery" placeholder="ค้นหา" @input="filterTable" />
                </div>
            </div>


            <!-- ตารางข้อมูล -->
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
    </div>
</template>

<script>
import LeaveDetails from '../../components/MenuPages/User/UserDetails.vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // ใช้สำหรับการจัดการตาราง (ถ้าต้องการ)
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
            isLoading: false  // เก็บสถานะการโหลด

        };
    },
    computed: {

        // กรองสถานที่ปฏิบัติงานที่ไม่ซ้ำกัน
        uniqueLocations() {
            const locations = this.paginatedUsers.map(user => user.lineId);
            return [...new Set(locations)];
        },
        // กรองตำแหน่งงานที่ไม่ซ้ำกัน
        uniquePositions() {
            const positions = this.paginatedUsers.map(user => user.position);
            return [...new Set(positions)];
        },
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
        generatePDF() {
            const doc = new jsPDF();

            // เพิ่มฟอนต์ภาษาไทย
            const yourBase64FontData = process.env.BASE64FONT;
        
            doc.addFileToVFS("Prompt-Medium.ttf", yourBase64FontData);
            doc.addFont("Prompt-Medium.ttf", "Prompt-Medium", "normal");
            doc.setFont("Prompt-Medium");

            // เพิ่มข้อความลงใน PDF
            doc.setFontSize(12);
            doc.text("สวัสดีโลก!", 10, 10);
            doc.text("นี่คือตัวอย่าง PDF ที่สร้างจาก Vue.js", 10, 20);
            doc.text("ข้อมูลเพิ่มเติมสามารถเพิ่มได้ตามต้องการ", 10, 30);

            // บันทึก PDF
            doc.save("example.pdf");
        },

        exportData() {
            // ข้อมูลตัวอย่างที่ตรงกับรูปแบบที่คุณต้องการ
            const data = [
                {
                    "ลำดับ": 1,
                    "รหัส": "WM59001C",
                    "สังกัด": "WM",
                    "ชื่อ-สกุล": "นาย ณัฐเศรษฐ เทพพิบูล",
                    "ชื่อเล่น": "แทค",
                    "ตำแหน่ง": "Chief Executive Officer",
                    "ประเภทพนักงาน": "พนักงานรายเดือน",
                    "ฝ่าย": "Committee",
                    "สถานที่ปฏิบัติงาน": "BKK",
                    "วันที่เริ่มงาน": "1/11/2021",
                    "วันที่ผ่านโปร": "28/2/2022",
                    "อายุงาน": 0,
                    "สิทธิ์ลาป่วย 30 วัน/ปี": 0,
                    "ป่วย/วัน": 0,
                    "ป่วย/ชม.": 0,
                    "รวมวันลาป่วย": 0,
                    "สิทธิ์คงเหลือวันลาป่วย": 30,
                    "สิทธิ์ลากิจ 6 วัน/ปี": 0,
                    "กิจ/วัน": 6,
                    "กิจ/ชม.": 0,
                    "รวมวันลากิจ": 0,
                    "สิทธิ์คงเหลือวันลากิจ": 6,
                    "สิทธิ์ลาพักร้อน 6 วัน/ปี": 0,
                    "พักร้อน/วัน": 0,
                    "พักร้อน/ชม.": 0,
                    "รวมพักร้อน": 0,
                    "สิทธิ์คงเหลือวันพักร้อน": 6,
                    "สิทธิ์พักร้อนที่ได้": 6,
                    "ไม่รับค่าจ้าง/วัน": 0,
                    "ไม่รับค่าจ้าง/ชม": 0,
                    "รวมไม่รับค่าจ้าง": 0,
                    "ลากิจพิเศษ": 0,
                    "ลาเพื่ออุปสมบท": 0,
                    "ลาคลอด": 0,
                    "ลาป่วย (เนื่องจากบาดเจ็บในงาน)/วัน": 0,
                    "ผู้อนุมัติการลาขั้นต้น": "นาย ธีรวุฒิ จันทดิษฐ์",
                    "ผู้อนุมัติสูงสุด": "นาย ธีรวุฒิ จันทดิษฐ์",
                }
            ];

            // แปลงข้อมูลเป็น Worksheet
            const ws = XLSX.utils.json_to_sheet(data);

            // สร้าง Workbook และเพิ่ม Worksheet ลงไป
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            // สร้างไฟล์ Excel และดาวน์โหลด
            XLSX.writeFile(wb, 'data.xlsx');
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
        viewUser(user) {
            this.selectedUser = user; // เลือกผู้ใช้ที่ต้องการดูรายละเอียด
        },
        goBack() {
            this.selectedUser = null; // ย้อนกลับไปยังรายการผู้ใช้
        },
        saveUser(updatedUser) {
            // console.log('Updated user:', updatedUser);

            const axios = require('axios');
            let data = JSON.stringify(updatedUser);

            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: process.env.API_URL + '/users/updateUser/' + updatedUser.id,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios.request(config)
                .then((response) => {
                    // console.log(response.data);
                    this.selectedUser = null; // กลับไปที่ตารางหลังจากบันทึก
                })
                .catch((error) => {
                    console.log(error);
                });

            // const index = this.users.findIndex(user => user.employeeId === updatedUser.employeeId);
            // if (index !== -1) {
            //     this.users.splice(index, 1, updatedUser); // อัพเดตข้อมูลผู้ใช้ในตาราง
            // }
            // this.selectedUser = null; // กลับไปที่ตารางหลังจากบันทึก
        },
        filterTable() {
            // ฟังก์ชันกรองข้อมูลตาราง
        },
        getUsers() {
            this.isLoading = true;  // เริ่มโหลดข้อมูล
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
                    this.isLoading = false;  // โหลดข้อมูลเสร็จแล้ว
                    // console.log(this.users)
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
.btn-export {
    background-color: #6e69da;
    color: white;
    /* padding: 12px 20px; */
    margin-left: 10px;
    height: 40px;
    border: none;
}

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