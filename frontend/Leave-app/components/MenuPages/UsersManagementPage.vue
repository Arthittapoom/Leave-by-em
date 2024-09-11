<template>
    <div class="scrollable-content">
        <!-- Filtering and Search Section -->
        <div v-if="!selectedUser" class="filter-search">
            <div>
                แสดง
                <select class="mr-2" v-model="itemsPerPage" @change="filterTable">
                    <option v-for="num in [5, 10, 15, 20 ,25]" :key="num" :value="num">{{ num }}</option>
                </select>
                รายการ
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
                    <th>ชื่อผู้ใช้</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ตำแหน่ง</th>
                    <th>สถานที่ปฏิบัติงาน</th>
                    <th>ปรับแต่ง</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(user, index) in filteredUsers.slice(0, itemsPerPage)" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ user.employeeId }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.fullName }}</td>
                    <td>{{ user.position }}</td>
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
            users: [
                { employeeId: '1001', username: 'Clara1', fullName: 'Clara Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
                { employeeId: '1002', username: 'Clara2', fullName: 'Jane Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
                { employeeId: '1003', username: 'Clara3', fullName: 'John Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
                { employeeId: '1004', username: 'Clara4', fullName: 'Sarah Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
                { employeeId: '1005', username: 'Clara5', fullName: 'Mike Doe', position: 'frontend developer', workLocation: 'สำนักงานใหญ่' },
                { employeeId: '1006', username: 'Clara6', fullName: 'Emily Doe', position: 'backend developer', workLocation: 'สำนักงานใหญ่' },
            ],
            selectedUser: null,
            searchQuery: '',
            statusFilter: '',
            positionFilter: '',
            itemsPerPage: 10, // จำนวนรายการที่แสดงต่อหน้า
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
    },
    methods: {
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
                            // employeeId: '1001', username: 'Clara1', fullName: 'Clara Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่'

                            employeeId: response.data[i].code,
                            username: response.data[i].code,
                            fullName: response.data[i].name,
                            position: response.data[i].position,
                            workLocation: response.data[i].workplace

                        });
                    }
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
</style>