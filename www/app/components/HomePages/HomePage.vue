    <template>
        <div>
            <!-- ส่วนแสดงสถานะการขอ -->
            <div v-if="statusLeave === 'submitted'" class="card-2 mt-4 pt-4 pb-4">

                <img v-if="leaveDetails.status === 'รออนุมัติ'" class="logo-status" :src="statusIcon[0]"
                    alt="status icon">
                <img v-if="leaveDetails.status === 'อนุมัติ'" class="logo-status-1" :src="statusIcon[2]"
                    alt="status icon">
                <img v-if="leaveDetails.status === 'ไม่อนุมัติ'" class="logo-status-1" :src="statusIcon[3]"
                    alt="status icon">
                <img v-if="leaveDetails.status === 'ยกเลิกคำขอ'" class="logo-status-1" :src="statusIcon[3]"
                    alt="status icon">

                <div class="row text-center" style="width: 100%;">
                    <div v-if="leaveDetails.status === 'รออนุมัติ'" class="col">{{ statusMessages.submitted }}</div>
                    <div v-if="leaveDetails.status === 'รออนุมัติ'" class="col">{{ statusMessages.approving }}</div>
                    <div v-if="leaveDetails.status === 'อนุมัติ'" class="col">{{ statusMessages.statusRequest }} <br>
                        หมายเหตุ: {{ leaveDetails.reasonText }}</div>
                    <div v-if="leaveDetails.status === 'ยกเลิกคำขอ'" class="col"> ยกเลิกคำขอ <br> หมายเหตุ: {{
                        leaveDetails.reasonText }}</div>
                    <div v-if="leaveDetails.status === 'ไม่อนุมัติ'" class="col"> ไม่อนุมัติ <br> หมายเหตุ: {{
                        leaveDetails.reasonText }}</div>
                </div>
                <br>
                <transition name="fade">
                    <div v-if="pageleaveDetail" class="container">
                        <div class="form-group">
                            <label for="leaveType">ประเภทการลา :</label>
                            <input type="text" id="leaveType" class="form-control" v-model="leaveDetails.type"
                                disabled />
                        </div>
                        <div v-if="leaveDetails.type !== 'ออกปฏิบัติงานนอกสถานที่' && leaveDetails.type !== 'ลาออก'"
                            class="form-group">
                            <label for="leaveReason">เหตุผลการลา :</label>
                            <input type="text" id="leaveReason" class="form-control" v-model="leaveDetails.reason"
                                disabled />
                        </div>
                        <div v-if="leaveDetails.type === 'ลาออก'" class="form-group">
                            <label for="leaveStartTime">เวลาเริ่มงาน :</label>
                            <input type="text" id="leaveStartTime" class="form-control"
                                v-model="leaveDetails.firstWorkDay" disabled />
                        </div>
                        <div v-if="leaveDetails.type === 'ลาออก'" class="form-group">
                            <label for="leaveEndTime">เวลาสิ้นสุดงาน :</label>
                            <input type="text" id="leaveEndTime" class="form-control" v-model="leaveDetails.lastWorkDay"
                                disabled />
                        </div>
                        <div v-if="leaveDetails.type === 'ลาออก'">
                            <div class="form-group">
                                <label for="leaveCertificate">ต้องการใบรับรอง :</label>
                                <input type="text" id="leaveCertificate" class="form-control"
                                    v-model="leaveDetails.needsCertification" disabled />
                            </div>
                            <div class="form-group">
                                <label for="leaveFunding">ต้องการเงิน :</label>
                                <input type="text" id="leaveFunding" class="form-control"
                                    v-model="leaveDetails.hasFunding" disabled />
                            </div>
                        </div>

                        <div v-if="leaveDetails.type !== 'ลาออก'" class="form-group">
                            <label for="leaveDate">วัน/เดือน/ปี ที่ต้องการลา :</label>
                            <input type="text" id="leaveDate" class="form-control" v-model="leaveDetails.date"
                                disabled />
                        </div>
                        <div v-if="leaveDetails.type !== 'ลาออก'" class="form-group">
                            <label for="leaveTime">เวลา ที่ต้องการลา :</label>
                            <input type="text" id="leaveTime" class="form-control" v-model="leaveDetails.time"
                                disabled />
                        </div>

                        <!-- เพิ่มรายละเอียดการลาแบบนอกสถานที่ -->
                        <div v-if="leaveDetails.type === 'ออกปฏิบัติงานนอกสถานที่'" class="form-group">
                            <label for="leaveWorkLocation">สถานที่ปฏิบัติงานนอกสถานที่ :</label>
                            <input type="text" id="leaveWorkLocation" class="form-control"
                                v-model="leaveDetails.workLocation" disabled />
                        </div>
                        <div v-if="leaveDetails.type === 'ออกปฏิบัติงานนอกสถานที่'" class="form-group">
                            <label for="leaveVehicle">ยานพาหนะ :</label>
                            <input type="text" id="leaveVehicle" class="form-control" v-model="leaveDetails.vehicle"
                                disabled />
                        </div>
                        <div v-if="leaveDetails.type === 'ออกปฏิบัติงานนอกสถานที่'" class="form-group">
                            <label for="leaveVehicleNumber">หมายเลขยานพาหนะ :</label>
                            <input type="text" id="leaveVehicleNumber" class="form-control"
                                v-model="leaveDetails.vehicleNumber" disabled />
                        </div>

                        <div class="mt-3">
                            <p>ผู้อนุมัติการลาขั้นต้น</p>
                            <p>{{ userData.initialLeaveApprover }}</p>
                        </div>
                        <div>
                            <p>ผู้อนุมัติสูงสุด</p>
                            <p>{{ userData.finalLeaveApprover }}</p>
                        </div>
                        <button class="button-cancel" @click="cancelRequest(leaveDetails)">ยกเลิกคำขอ</button>
                    </div>
                </transition>
                <!-- Buttons with transition -->
                <transition name="fade">
                    <button v-if="!pageleaveDetail" @click="pageleaveDetail = true" class="button-detail-2">...</button>
                </transition>
                <transition name="fade">
                    <button v-if="pageleaveDetail" @click="pageleaveDetail = false" class="button-detail-2">...</button>
                </transition>
            </div>

            <!-- รายการล่าสุด -->
            <div class="card-3">
                <p>รายการล่าสุด</p>
                <div v-for="(leave, index) in leaveItems" :key="index" class="leave-item">
                    <div class="leave-icon">
                        <img v-if="leave.status === 'อนุมัติ'" :src="statusIcon[2]" alt="leave icon" />
                        <img v-if="leave.status === 'ไม่อนุมัติ' || leave.status === 'ยกเลิกคำขอ'" :src="statusIcon[3]"
                            alt="leave icon" />
                        <img v-if="leave.status === 'รออนุมัติ'" :src="statusIcon[4]" alt="leave icon" />
                    </div>
                    <div class="leave-info">
                        <p>{{ leave.type }} : {{ leave.reason }}</p>
                        <p v-if="leave.type !== 'ลาออก'">{{ leave.startDate }} | {{ leave.startTime }}</p>
                    </div>
                    <div class="leave-actions">
                        <a v-if="leave.hasEvidence" :href="leave.evidenceLink">{{ leave.evidenceText }}</a>
                        <a @click.prevent="openModal(leave)" href="#">{{ leave.showDetail ? 'ซ่อนรายละเอียด' :
                            'รายละเอียด'
                            }}</a>
                    </div>
                </div>
            </div>

            <!-- Modal for Leave Details -->
            <div v-if="modalVisible" class="modal">
                <div class="modal-content">
                    <span class="close" @click="modalVisible = false">&times;</span>
                    <h2>รายละเอียดการลา</h2>
                    <p>ประเภทการลา: {{ selectedLeave.type }}</p>
                    <p v-if="selectedLeave.type !== 'ลาออก'">เหตุผลการลา: {{ selectedLeave.reason }}</p>
                    <p v-if="selectedLeave.type !== 'ลาออก'">วันที่: {{ selectedLeave.startDate }} ถึง {{
                        selectedLeave.endDate }}</p>
                    <p v-if="selectedLeave.type !== 'ลาออก'">เวลา: {{ selectedLeave.startTime }} ถึง {{
                        selectedLeave.endTime }}</p>
                    <p>วันที่ส่งคำขอ: {{ formatDate(selectedLeave.sendDate) }}</p>
                    <p>สถานะ: {{ selectedLeave.status }}</p>
                    <p>หมายเหตุ: {{ selectedLeave.reasonText }}</p>
                    <div v-if="selectedLeave.type === 'ออกปฏิบัติงานนอกสถานที่'">
                        <p>สถานที่: {{ selectedLeave.workLocation }}</p>
                        <p>ยานพาหนะ: {{ selectedLeave.vehicle }}</p>
                        <p>หมายเลข: {{ selectedLeave.vehicleNumber }}</p>
                    </div>
                    <div v-if="selectedLeave.type === 'ลาออก'">
                        <p>วันที่เริ่มงาน: {{ formatDate(selectedLeave.firstWorkDay) }}</p>
                        <p>วันที่สิ้นสุดงาน: {{ formatDate(selectedLeave.lastWorkDay) }}</p>
                        <p>ต้องการใบรับรอง: {{ selectedLeave.needsCertification ? 'ใช่' : 'ไม่ใช่' }}</p>
                        <p>ต้องการเงิน: {{ selectedLeave.hasFunding ? 'ใช่' : 'ไม่ใช่' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            statusIcon: [
                "/home/status-1.png",
                "/home/status-2.png",
                "/home/status-3.png",
                "/home/status-4.png",
                "/home/status-5.png",
            ],
            statusLeave: "submitted",
            statusMessages: {
                submitted: "ส่งคำขอ",
                approving: "รออนุมัติ",
                statusRequest: "คำขอสำเร็จ"
            },
            leaveDetails: {
                type: '',
                reason: '',
                date: '',
                time: '',
                id: '',
                workLocation: '',
                vehicle: '',
                vehicleNumber: '',
                firstWorkDay: '',
                lastWorkDay: '',
                needsCertification: '',
                hasFunding: '',




            },
            leaveItems: [],   // รวมรายการใบลาทั้งหมดที่มาจากทั้งสอง API
            profile: {},      // ข้อมูลผู้ใช้ที่ดึงจาก localStorage
            pageleaveDetail: false,
            modalVisible: false,
            selectedLeave: {}
        };
    },
    props: ['userData'],
    watch: {
        leaveItems(newLeaveItems) {
            if (newLeaveItems.length > 0) {
                const latestLeave = newLeaveItems[0];
                this.leaveDetails.type = latestLeave.type;
                this.leaveDetails.reason = latestLeave.reason;
                this.leaveDetails.date = `${latestLeave.startDate} - ${latestLeave.endDate}`;
                this.leaveDetails.time = `${latestLeave.startTime} - ${latestLeave.endTime}`;
                this.leaveDetails.id = latestLeave._id;
                this.leaveDetails.lineId = latestLeave.lineId;
                this.leaveDetails.status = latestLeave.status;
                this.leaveDetails.reasonText = latestLeave.reasonText;
                this.leaveDetails.workLocation = latestLeave.workLocation
                this.leaveDetails.vehicle = latestLeave.vehicle,
                    this.leaveDetails.vehicleNumber = latestLeave.vehicleNumber,
                    this.leaveDetails.firstWorkDay = latestLeave.firstWorkDay
                this.leaveDetails.lastWorkDay = latestLeave.lastWorkDay
                this.leaveDetails.needsCertification = latestLeave.needsCertification
                this.leaveDetails.hasFunding = latestLeave.hasFunding
            } else {
                // กรณีไม่มีข้อมูลการลา
                this.leaveDetails.type = 'ประเภทการลาเริ่มต้น';
                this.leaveDetails.reason = 'เหตุผลการลาเริ่มต้น';
                this.leaveDetails.date = '01/01/2024 - 01/01/2024';
                this.leaveDetails.time = '09:00 - 18:00';
            }
        }
    },
    methods: {
        async getLeavesDataByLineId(id) {
            try {
                // เรียก API ทั้งสามพร้อมกัน
                const leaveRequest = axios.get(`${process.env.API_URL}/leave/getLeavesByLineId/${id}`);
                const leaveOutsideRequest = axios.get(`${process.env.API_URL}/LeaveOutside/getLeavesOutsideByLineId/${id}`);
                const leaveResignRequest = axios.get(`${process.env.API_URL}/LeaveResign/getLeavesResignByLineId/${id}`);

                // ดึงข้อมูลจาก API ทั้งสาม
                const [leaveResponse, leaveOutsideResponse, leaveResignResponse] = await Promise.all([leaveRequest, leaveOutsideRequest, leaveResignRequest]);

                // แปลงข้อมูลจาก leaveResponse
                const leaveItems = leaveResponse.data.map(leave => ({
                    ...leave,
                    showDetail: false
                }));

                // แปลงข้อมูลจาก leaveOutsideResponse
                const leaveOutsideItems = leaveOutsideResponse.data.map(leave => ({
                    ...leave,
                    showDetail: false,
                    type: 'ออกปฏิบัติงานนอกสถานที่'  // ประเภทสำหรับการทำงานนอกสถานที่
                }));

                // แปลงข้อมูลจาก leaveResignResponse
                const leaveResignItems = leaveResignResponse.data.map(resign => ({
                    ...resign,
                    showDetail: false,
                    type: 'ลาออก',  // ประเภทสำหรับการลาออก
                    reasonText: resign.reasonText || 'ไม่มีเหตุผล',  // ตรวจสอบเหตุผลการลาออก
                    firstWorkDay: resign.firstWorkDay,
                    lastWorkDay: resign.lastWorkDay,
                    needsCertification: resign.needsCertification,
                    hasFunding: resign.hasFunding,
                    status: resign.status || 'รออนุมัติ',
                    sendDate: resign.sendDate || new Date(),
                    initialLeaveApprover: resign.initialLeaveApprover || 'ไม่ระบุ',
                    finalLeaveApprover: resign.finalLeaveApprover || 'ไม่ระบุ',
                    lineId: resign.lineId,
                    userId: resign.userId,
                }));

                // รวมข้อมูลทั้งสามและเรียงลำดับตามวันที่ส่ง
                this.leaveItems = [...leaveItems, ...leaveOutsideItems, ...leaveResignItems]
                    .sort((a, b) => new Date(b.sendDate) - new Date(a.sendDate));

            } catch (error) {
                console.error("Error fetching leave data:", error);
            }
        }
        ,

        cancelRequest(leaveDetails) {
    const axios = require('axios');
    let data = JSON.stringify({
        "status": "ยกเลิกคำขอ"
    });

    // กำหนด URL ขึ้นอยู่กับประเภทการลา
    let url;
    if (leaveDetails.type === 'ออกปฏิบัติงานนอกสถานที่') {
        url = `${process.env.API_URL}/LeaveOutside/updateLeaveOutside/${leaveDetails.id}`; // URL สำหรับการลาแบบนอกสถานที่
    } else if (leaveDetails.type === 'ลาออก') {
        url = `${process.env.API_URL}/LeaveResign/updateLeaveResign/${leaveDetails.id}`; // URL สำหรับการลาออก
    } else {
        url = `${process.env.API_URL}/leave/updateLeave/${leaveDetails.id}`; // URL สำหรับการลาในสถานที่
    }

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: url, // ใช้ URL ที่กำหนด
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            // ตรวจสอบ lineId ก่อนที่จะเรียก getLeavesDataByLineId
            if (leaveDetails.lineId) {
                let notifyConfig = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: process.env.API_URL + '/lineApi/sendImage/' + leaveDetails.lineId,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({ "message": "ยกเลิกคำขอ" })
                };

                axios.request(notifyConfig)
                    .then((response) => {
                        console.log(response.data);
                        this.statusLeave = "cancelled";
                        this.getLeavesDataByLineId(); // เพิ่มการเรียกข้อมูลหลังจากยกเลิกคำขอ
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                console.error("lineId is undefined");
            }
        })
        .catch((error) => {
            console.log(error);
        });
},




        openModal(leave) {
            this.selectedLeave = leave;
            this.modalVisible = true;
        },

        formatDate(dateString) {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            return new Date(dateString).toLocaleDateString('th-TH', options);
        }
    },
    mounted() {
        const profileData = localStorage.getItem('profile');
        if (profileData) {
            this.profile = JSON.parse(profileData);
            this.getLeavesDataByLineId(this.profile.userId);  // เรียกใช้ฟังก์ชันที่รวมข้อมูลจากทั้งสอง API
        }
    }
};
</script>


<style scoped>
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.button-cancel {
    background: #FF515B;
    border-radius: 25px;
    width: 50%;
    height: 60px;
    margin-left: 25%;
    border: none;
    padding: 10px;
    font-size: 16px;
}

.logo-status {
    width: 250px;
    align-self: center;
    height: auto;
    margin-top: 10px;
    margin-bottom: 10px;
}

.logo-status-1 {
    width: 80px;
    align-self: center;
    height: auto;
    margin-top: 10px;
    margin-bottom: 10px;
}

.button-detail,
.button-detail-2 {
    background: rgba(255, 255, 255, 0);
    border-radius: 50px;
    width: 20%;
    font-weight: bold;
    margin-top: 10px;
    height: 10px;
    margin-bottom: 30px;
    border: none;
    padding: 10px;
    font-size: 30px;
}

.card-2 {
    box-sizing: border-box;
    background: #E5D2FF;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 19px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 355px;
    position: relative;
    z-index: 0;
    top: -50px;
}

.card-3 {
    align-items: start;
    text-align: start;
}

.leave-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
}

.leave-icon img {
    width: auto;
    height: 30px;
}

.leave-info p {
    margin: 0;
    font-size: 14px;
}

.leave-actions a {
    margin-right: 10px;
    font-size: 14px;
    color: #007BFF;
    text-decoration: none;
}

.leave-actions a:hover {
    text-decoration: underline;
}

/* Modal Styles */
.modal {
    display: flex;
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
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 500px;
    border-radius: 8px;
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
</style>
