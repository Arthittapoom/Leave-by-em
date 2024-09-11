<template>
    <div>
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
                <tr v-for="(leave, index) in leaveRequests" :key="leave.employeeId + index">
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
                        <button @click="viewUser(leave)" class="view-btn"><img class="icon"
                                src="../../static/admin/admin/icon-1.png" alt=""></button>
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
            leaveRequests: [
                {
                    employeeId: 'A123456',
                    fullName: 'Gracezel Lewalin',
                    position: 'Assistant PM',
                    startDate: 'xx/xx/xx',
                    startTime: 'xx:xx น.',
                    endDate: 'xx/xx/xx',
                    endTime: 'xx:xx น.',
                    status: 'อนุมัติ',
                },
                {
                    employeeId: 'B123456',
                    fullName: 'John Doe',
                    position: 'Assistant PM',
                    startDate: 'xx/xx/xx',
                    startTime: 'xx:xx น.',
                    endDate: 'xx/xx/xx',
                    endTime: 'xx:xx น.',
                    status: 'ไม่อนุมัติ',
                },
                {
                    employeeId: 'C123456',
                    fullName: 'Jane Doe',
                    position: 'Assistant PM',
                    startDate: 'xx/xx/xx',
                    startTime: 'xx:xx น.',
                    endDate: 'xx/xx/xx',
                    endTime: 'xx:xx น.',
                    status: 'รออนุมัติ',
                },
            ],
            selectedUser: null, // เก็บข้อมูลผู้ใช้ที่ถูกเลือก
        };
    },
    methods: {
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
</style>