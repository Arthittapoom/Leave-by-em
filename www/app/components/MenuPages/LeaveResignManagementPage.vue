<template>
    <div>
        <!-- แสดง UI โหลดเมื่อกำลังดึงข้อมูล -->
        <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- เมื่อโหลดข้อมูลเสร็จแล้ว -->
        <div v-else>
            <div v-if="!selectedUser" class="filter-search">
                <div>
                    <div class="custom-pagination">
                        <button @click="prevPage" :disabled="currentPage === 1">◀</button>
                        <button v-for="page in totalPages" :key="page" @click="changePage(page)"
                            :class="{ 'active-page': page === currentPage }">
                            {{ page }}
                        </button>
                        <button @click="nextPage" :disabled="currentPage === totalPages">▶</button>
                    </div>
                </div>
                <div>
                    <input type="text" v-model="searchQuery" placeholder="ค้นหา" @input="filterTable" />
                </div>
            </div>

            <!-- Table Section -->
            <ResignDetails v-if="selectedUser" :user="selectedUser" @go-back="goBack" @save="saveUser" />
            <table v-if="!selectedUser">
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>รหัสพนักงาน</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ตำแหน่ง</th>
                        <th>วันที่ลาออก</th>
                        <th>สถานะคำขอ</th>
                        <th>ปรับแต่ง</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(resignation, index) in paginatedResignationRequests"
                        :key="resignation.employeeId + index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ resignation.employeeId }}</td>
                        <td>{{ resignation.fullName }}</td>
                        <td>{{ resignation.position }}</td>
                        <td>{{ resignation.sendDate }}</td>
                        <td>
                            <span :class="{
                                'approved': resignation.status === 'อนุมัติ',
                                'rejected': resignation.status === 'ไม่อนุมัติ',
                                'pending': resignation.status === 'รออนุมัติ',
                                'cancelled': resignation.status === 'ยกเลิกคำขอ'
                            }">
                                {{ resignation.status }}
                            </span>
                        </td>
                        <td class="action-buttons">
                            <button @click="viewUser(resignation)" class="view-btn">
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
import ResignDetails from '../../components/MenuPages/Leave/ResignDetails.vue';

export default {
    components: {
        ResignDetails
    },
    data() {
        return {
            resignationRequests: [],
            selectedUser: null,
            searchQuery: '',
            itemsPerPage: 10,
            currentPage: 1,
            isLoading: false,
        };
    },
    computed: {
        filteredResignationRequests() {
            return this.resignationRequests.filter((resignation) => {
                return (
                    resignation.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    resignation.employeeId.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            });
        },
        paginatedResignationRequests() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredResignationRequests.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredResignationRequests.length / this.itemsPerPage);
        }
    },
    mounted() {
        this.getResignationData();
    },
    methods: {
        async getResignationData() {
    const axios = require('axios');
    this.isLoading = true;

    try {
        const response = await axios.get(`${process.env.API_URL}/LeaveResign/getLeavesResign`);
        const resignationRequests = await Promise.all(response.data.map(async resignation => {
            // สร้าง config สำหรับการดึงข้อมูลผู้ใช้ตาม lineId
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.API_URL}/users/getUserByLineId/${resignation.lineId}`,
                headers: {}
            };

            try {
                // ดึงข้อมูลผู้ใช้จาก API
                const userResponse = await axios.request(config);
                const userData = userResponse.data;

                // หากมีข้อมูลจาก API ให้แสดง
                return {
                    id: resignation._id,
                    employeeId: userData.code || 'ไม่พบข้อมูล', 
                    fullName: userData.name || 'ไม่พบข้อมูล', 
                    position: userData.position || 'ไม่พบข้อมูล', 
                    sendDate: resignation.sendDate ? resignation.sendDate.slice(0, 10) : 'ไม่พบข้อมูล',
                    status: resignation.status || 'รออนุมัติ',
                    reasonText: resignation.reasonText || 'ไม่มีเหตุผล',
                    lineId: resignation.lineId,
                    dataUser: userData,
                    dataResignation: resignation
                };

            } catch (error) {
                // จัดการกรณีที่ API ไม่พบข้อมูล (404) หรือเกิดข้อผิดพลาดอื่น ๆ
                console.error(`Error fetching user data for Line ID ${resignation.lineId}:`, error);

                // คืนค่าข้อมูลที่ไม่พบผู้ใช้
                return {
                    id: resignation._id,
                    employeeId: 'ไม่พบข้อมูล', // กำหนดค่าเริ่มต้นเมื่อไม่พบผู้ใช้
                    fullName: 'ไม่พบข้อมูล',
                    position: 'ไม่พบข้อมูล',
                    sendDate: resignation.sendDate ? resignation.sendDate.slice(0, 10) : 'ไม่พบข้อมูล',
                    status: resignation.status || 'รออนุมัติ',
                    reasonText: resignation.reasonText || 'ไม่มีเหตุผล',
                    lineId: resignation.lineId,
                    dataUser: null, // ไม่มีข้อมูลผู้ใช้
                    dataResignation: resignation
                };
            }
        }));

        // จัดเรียง resignationRequests โดยเรียงจาก sendDate ล่าสุด
        this.resignationRequests = resignationRequests.sort((a, b) => {
            return new Date(b.sendDate) - new Date(a.sendDate); // เรียงตามวันที่จากใหม่ไปเก่า
        });

    } catch (error) {
        console.log("Error fetching resignation data:", error);
    } finally {
        this.isLoading = false;
    }
}
,


        viewUser(user) {
            this.selectedUser = user;
        },
        goBack() {
            this.selectedUser = null;
        },
        saveUser(updatedUser) {
            // Handle save logic for resignation updates
            // console.log('Saved user data:', updatedUser);

            const axios = require('axios');

            // ฟังก์ชันสำหรับดึงและอัปเดตจำนวนวันลา
            const incrementLeave = async (lineId, apiField) => {
                try {
                    // ดึงข้อมูลผู้ใช้
                    let getConfig = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        url: `${process.env.API_URL}/users/getUserByLineId/${lineId}`,
                        headers: { 'Content-Type': 'application/json' }
                    };

                    const userResponse = await axios.request(getConfig);
                    let currentLeaveCount = parseInt(userResponse.data[apiField]) || 0;

                    // บวกเพิ่ม 1
                    let updatedLeaveCount = currentLeaveCount + 1;
                    let data = JSON.stringify({ [apiField]: updatedLeaveCount });

                    // อัปเดตข้อมูลวันลา
                    let updateConfig = {
                        method: 'put',
                        maxBodyLength: Infinity,
                        url: `${process.env.API_URL}/users/updateUserByLineId/${lineId}`,
                        headers: { 'Content-Type': 'application/json' },
                        data: data
                    };

                    await axios.request(updateConfig);
                } catch (error) {
                    console.error(error);
                }
            };

            // ฟังก์ชันสำหรับส่งการแจ้งเตือนผ่าน LINE API
            const sendLineNotification = (lineId, message) => {
                let lineData = JSON.stringify({ "message": message });
                let lineConfig = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${process.env.API_URL}/lineApi/sendImage/${lineId}`,
                    headers: { 'Content-Type': 'application/json' },
                    data: lineData
                };

                axios.request(lineConfig)
                    .then((response) => console.log())
                    .catch((error) => console.log(error));
            };

            // เช็คสถานะ
            if (updatedUser.status === 'อนุมัติ') {
                // เช็คประเภทของการลาและอัปเดตจำนวนวันลา
                switch (updatedUser.leaveType) {
                    case 'ลาป่วย':
                        incrementLeave(updatedUser.lineId, 'totalSickLeave');
                        break;
                    case 'ลากิจ':
                        incrementLeave(updatedUser.lineId, 'totalPersonalLeave');
                        break;
                    case 'ลาพักร้อน':
                        incrementLeave(updatedUser.lineId, 'totalVacationLeave');
                        break;
                    case 'ลากิจพิเศษ':
                    case 'อุปสมบท':
                    case 'ลาคลอด':
                    case 'ลาไม่รับค่าจ้าง':
                        incrementLeave(updatedUser.lineId, 'totalUnpaidLeave');
                        break;
                    default:
                        console.log('ไม่พบประเภทการลา');
                }
            }

            // ใช้ API สำหรับการอัปเดตสถานะการลาออก
            let apiUrl = `${process.env.API_URL}/LeaveResign/updateLeaveResign/${updatedUser.id}`;

            // เตรียมข้อมูลที่ต้องการอัปเดตสถานะการลา
            let data = JSON.stringify({
                "status": updatedUser.status,
                "reasonText": updatedUser.reasonText || null
            });

            let config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: apiUrl,
                headers: { 'Content-Type': 'application/json' },
                data: data
            };

            // อัปเดตสถานะการลา
            axios.request(config)
                .then((response) => {
                    alert('บันทึกสำเร็จ');
                    const status = response.data.status;

                    // ส่งการแจ้งเตือนตามสถานะ
                    if (status === 'อนุมัติ') {
                        sendLineNotification(updatedUser.lineId, 'อนุมัติ');
                    } else if (status === 'ไม่อนุมัติ') {
                        sendLineNotification(updatedUser.lineId, 'ไม่อนุมัติ');
                    }

                    this.selectedUser = null; // ล้างข้อมูลผู้ใช้ที่เลือก
                })
                .catch((error) => {
                    console.log(error);
                });

            this.selectedUser = null; // กลับไปที่ตารางหลังจากบันทึก
        }
        ,

        filterTable() {
            // Filtier logic here, but it's handled in computed property
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
