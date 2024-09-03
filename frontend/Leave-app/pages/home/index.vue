<template>
    <div class="background">
        <div class="from-login mt-5">
            <p class="Profile-style">Profile</p>
            <img class="logo" :src=profile.pictureUrl alt="">
            <div class="card pt-4 pb-4 pl-5 pr-5">
                <div class="p-canter">

                    <p>ชื่อ-นามสกุล : {{ data_user.name }}</p>

                    <div class="box">
                        <p>รหัสพนักงาน : {{ data_user.code }}</p>
                        <p>ตำแหน่ง : {{ data_user.position }}</p>
                        <p v-if="pageuserDetail == true">สังกัด : {{ data_user.department }}</p>
                        <p v-if="pageuserDetail == true">ประเภทพนักงาน : {{ data_user.type }}</p>
                        <p v-if="pageuserDetail == true">ฝ่าย : {{ data_user.division }}</p>
                        <p v-if="pageuserDetail == true">สถานที่ปฏิบัติงาน : {{ data_user.workplace }}</p>
                        <p v-if="pageuserDetail == true">อายุงาน : {{ data_user.years }}</p>
                        <p v-if="pageuserDetail == true">เบอร์โทรศัพท์ : {{ data_user.phone }}</p>
                    </div>
                    <button v-if="pageuserDetail == false" @click="pageuserDetail = true"
                        class="button-detail">...</button>
                    <button v-if="pageuserDetail == true" @click="pageuserDetail = false"
                        class="button-detail">...</button>
                </div>
            </div>
            <div v-if="statusLeave == 'ส่งคำขอสำเร็จ'" class="card-2 mt-4 pt-4 pb-4 pl-4 pr-4">
                <img class="logo-status" src="../../static/home/status.png" alt="">
                <div class="row text-center" style="width: 100%;">
                    <div class="col">ส่งคำขอสำเร็จ</div>
                    <div class="col">กำลังอนุมัติ</div>
                    <div class="col">สถานะคำขอ</div>
                </div>
                <br>


                <div v-if="pageleaveDetail == true" class="container">
                    <div class="form-group">
                        <label for="leaveType">ประเภทการลา :</label>
                        <input type="text" id="leaveType" class="form-control" placeholder="ลาป่วย" />
                    </div>
                    <div class="form-group">
                        <label for="leaveReason">เหตุผลการลา :</label>
                        <input type="text" id="leaveReason" class="form-control" placeholder="เป็นโควิด" />
                    </div>
                    <div class="form-group">
                        <label for="leaveDate">วัน/เดือน/ปี ที่ต้องการลา :</label>
                        <input type="text" id="leaveDate" class="form-control" placeholder="XX/XX/XXXX - XX/XX/XXXX" />
                    </div>
                    <div class="form-group">
                        <label for="leaveTime">เวลา ที่ต้องการลา :</label>
                        <input type="text" id="leaveTime" class="form-control" placeholder="22:00 - 23:00" />
                    </div>
                    <div class="mt-3">
                        <p>ผู้อนุมัติการลาขั้นต้น</p>
                        <p>{{ data_user.initialLeaveApprover }}</p>
                    </div>
                    <div>
                        <p>ผู้อนุมัติสูงสุด</p>
                        <p>{{ data_user.finalLeaveApprover }}</p>
                    </div>
                    <button class="button-cancel">ยกเลิกคำขอ</button>
                </div>
                <button v-if="pageleaveDetail == false" @click="pageleaveDetail = true"
                    class="button-detail-2">...</button>
                <button v-if="pageleaveDetail == true" @click="pageleaveDetail = false"
                    class="button-detail-2">...</button>

            </div>


            <div class="card-3 ">
                <p>รายการล่าสุด</p>
                <div class="leave-item">
                    <div class="leave-icon">
                        <!-- <img src="path/to/lock-icon.png" alt="lock icon" /> -->
                    </div>
                    <div class="leave-info">
                        <p>ลาป่วย / เป็นไข้หวัดใหญ่</p>
                        <p>10 ส.ค. 67 | 06:35 น.</p>
                    </div>
                    <div class="leave-actions">
                        <a href="#">ดูหลักฐานการลา</a>
                        <a href="#">รายละเอียด</a>
                    </div>
                </div>
                <div class="leave-item">
                    <div class="leave-icon">
                        <!-- <img src="path/to/person-icon.png" alt="person icon" /> -->
                    </div>
                    <div class="leave-info">
                        <p>ลากิจ / พาแมวไปทำหมัน</p>
                        <p>16 ส.ค. 67 | 08:52 น.</p>
                    </div>
                    <div class="leave-actions">
                        <a href="#">ดูหลักฐานการลา</a>
                        <a href="#">รายละเอียด</a>
                    </div>
                </div>
                <div class="leave-item">
                    <div class="leave-icon">
                        <!-- <img src="path/to/lock-warning-icon.png" alt="lock warning icon" /> -->
                    </div>
                    <div class="leave-info">
                        <p>ลาป่วย / ท้องเสีย</p>
                        <p>19 ก.ค. 67 | 07:20 น.</p>
                    </div>
                    <div class="leave-actions">
                        <a href="#">กรุณาส่งหลักฐานการลา</a>
                        <a href="#">รายละเอียด</a>
                    </div>
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
            data_user: {},

            profile: {
                displayName: '',
                pictureUrl: '',
                statusMessage: '',
                userId: '',
            },

            pageuserDetail: false,
            pageleaveDetail: false,
            statusLeave: "ส่งคำขอสำเร็จ",

        }
    },
    methods: {
        async getdata(id) {
            try {
                let config = {
                    method: 'get',
                    url: `${process.env.API_URL}/users/getUsers`,
                };

                const response = await axios.request(config);

                const filteredData = response.data.filter(item => item.lineId === id);

                if (filteredData.length > 0) {
                    this.data_user = {
                        id: filteredData[0]._id,
                        name: filteredData[0].name,
                        nickname: filteredData[0].nickname,
                        department: filteredData[0].department,
                        code_id: filteredData[0].code,
                        position: filteredData[0].position,
                        type: filteredData[0].employeeType,
                        division: filteredData[0].division,
                        workplace: filteredData[0].workplace,
                        years: `${filteredData[0].diffDays_days} วัน`,
                        initialLeaveApprover: filteredData[0].initialLeaveApprover,
                        finalLeaveApprover: filteredData[0].finalLeaveApprover,
                        phone: filteredData[0].phone,
                        code: filteredData[0].code
                    };
                    this.newPhone = this.data_user.phone; // ตั้งค่าเบอร์โทรศัพท์ใหม่
                } else {
                    alert('ไม่พบข้อมูลในระบบ');
                }
            } catch (error) {
                console.error(error);
            }
        },
        register(data_user) {
            alert('ดึงข้อมูลเรียบร้อย ID ' + data_user.id)
        }
    },
    mounted() {

        const profileData = localStorage.getItem('profile');
        let profile = {};
        if (profileData) {
            const parsedData = JSON.parse(profileData);
            profile = {
                displayName: parsedData.displayName,
                pictureUrl: parsedData.pictureUrl,
                statusMessage: parsedData.statusMessage,
                userId: parsedData.userId
            };
        }
        this.profile = profile;

        this.getdata(this.profile.userId);
    }
}
</script>

<style scoped>
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



.button-detail {
    background: rgb(255, 255, 255);
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

.box {
    background: rgba(184, 160, 222, 0.2);
    border-radius: 7px;
    padding: 10px;
    margin-top: 10px;

}

.background {
    /* สำหรับมือถือ */
    background-image: url("/login/bg.svg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: start;
}



.from-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 50px;


    .card {
        box-sizing: border-box;
        background: #FFFFFF;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 19px;
        /* อยู่ตรงกลาง */
        display: flex;
        flex-direction: column;
        align-items: center;

        position: relative;
        z-index: 0;
        top: -50px;

    }

    .card-2 {
        box-sizing: border-box;
        background: #E5D2FF;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 19px;
        /* อยู่ตรงกลาง */
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 350px;

        position: relative;
        z-index: 0;
        top: -50px;

    }

    .card-3 {
        align-items: start;
        text-align: start;
    }


    .p-canter {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;

    }

    .logo {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: #FFFFFF;
        position: relative;
        z-index: 1;
        top: -10px;
    }

    .Profile-style {
        font-weight: 300;
        font-size: 24px;
    }

    .leave-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #ddd;
    }

    .leave-icon img {
        width: 20px;
        height: 20px;
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

}
</style>
