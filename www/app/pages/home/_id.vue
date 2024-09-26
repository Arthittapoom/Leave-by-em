<template>
    <div class="background">
        <div class="from-login mt-5">
            <p class="Profile-style">Profile</p>
            <img class="logo" :src="profile.pictureUrl" alt="">
            <div class="card pt-4 pb-4 pl-5 pr-5">
                <div class="p-canter">

                    <p>ชื่อ-นามสกุล : {{ data_user.name }}</p>

                    <div class="box">
                        <p>รหัสพนักงาน : {{ data_user.code }}</p>
                        <p>ตำแหน่ง : {{ data_user.position }}</p>

                        <!-- Transition for user details -->
                        <transition name="fade">
                            <div v-if="pageuserDetail">
                                <p>สังกัด : {{ data_user.department }}</p>
                                <p>ประเภทพนักงาน : {{ data_user.type }}</p>
                                <p>ฝ่าย : {{ data_user.division }}</p>
                                <p>สถานที่ปฏิบัติงาน : {{ data_user.workplace }}</p>
                                <p>อายุงาน : {{ data_user.years }}</p>
                                <p>เบอร์โทรศัพท์ : {{ data_user.phone }}</p>
                            </div>
                        </transition>
                    </div>

                    <!-- Buttons with transition -->
                    <transition name="fade">
                        <button v-if="!pageuserDetail" @click="pageuserDetail = true" class="button-detail">...</button>
                    </transition>
                    <transition name="fade">
                        <button v-if="pageuserDetail" @click="pageuserDetail = false" class="button-detail">...</button>
                    </transition>
                </div>
            </div>

            <!-- Routes -->
            <HomePage v-if="pages === 'home'" />
            <LeaveAbsence v-if="pages === 'leaveabsence'" :userData="data_user" />
            <LeaveOutside v-if="pages === 'leaveoutside'" />
            <ResignFromWork v-if="pages === 'resignfromwork'" />
            <ListRequests v-if="pages === 'listrequests'" />

            <div class="pt-5"></div>



            <!-- footer -->
            <div class="footer-home row">
                <button @click="pages = 'leaveabsence'; page(1)" class="col item-footer item-footer-active-1">
                    <img class="img-menu-1" src="../../static/home/menu-1.png" alt="">
                    <p v-if="role !== 'admin'">ลาหยุด</p>
                    <p class="p-admin" v-if="role === 'admin'">ลาหยุด</p>
                </button>
                <button @click="pages = 'leaveoutside'; page(2)" class="col item-footer item-footer-active-2">
                    <img class="img-menu-2" src="../../static/home/menu-2.png" alt="">
                    <p v-if="role !== 'admin'">นอกสถานที่</p>
                    <p class="p-admin" v-if="role === 'admin'">นอกสถานที่</p>
                </button>
                <button @click="pages = 'resignfromwork'; page(3)" class="col item-footer item-footer-active-3">
                    <img class="img-menu-3" src="../../static/home/menu-3.png" alt="">
                    <p v-if="role !== 'admin'">ลาออก</p>
                    <p class="p-admin" v-if="role === 'admin'">ลาออก</p>
                </button>
                <button v-if="role === 'admin'" @click="pages = 'listrequests'; page(5)"
                    class="col item-footer item-footer-active-5">
                    <img class="img-menu-5" src="../../static/home/menu-5.png" alt="">
                    <p v-if="role !== 'admin'">คำขอ</p>
                    <p class="p-admin" v-if="role === 'admin'">คำขอ</p>
                </button>
                <button @click="pages = 'home'; page(4)" class="col item-footer item-footer-active-4">
                    <img class="img-menu-4" src="../../static/home/menu-4.png" alt="">
                    <p v-if="role !== 'admin'">โปรไฟล</p>
                    <p class="p-admin" v-if="role === 'admin'">โปรไฟล</p>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import HomePage from '../../components/HomePages/HomePage.vue';
import LeaveAbsence from '../../components/HomePages/LeaveAbsence.vue';
import LeaveOutside from '../../components/HomePages/LeaveOutside.vue';
import ResignFromWork from '../../components/HomePages/ResignFromWork.vue';
import ListRequests from '../../components/HomePages/ListRequests.vue';
export default {
    components: {
        HomePage,
        LeaveAbsence,
        LeaveOutside,
        ResignFromWork,
        ListRequests
    },
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
            pages: 'home',

            // กำหนดสิทธิ์
            role: 'admin',
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
                        code: filteredData[0].code,

                        diffDays_days_exl: filteredData[0].diffDays_days_exl,
                        sickLeave_days: filteredData[0].sickLeave_days,
                        sickLeave_hours: filteredData[0].sickLeave_hours,
                        totalSickLeave: filteredData[0].totalSickLeave,
                        remainingSickLeave: filteredData[0].remainingSickLeave,
                        personalLeave_days: filteredData[0].personalLeave_days,
                        personalLeave_hours: filteredData[0].personalLeave_hours,
                        totalPersonalLeave: filteredData[0].totalPersonalLeave,
                        remainingPersonalLeave: filteredData[0].remainingPersonalLeave,
                        vacationLeave_days: filteredData[0].vacationLeave_days,
                        vacationLeave_hours: filteredData[0].vacationLeave_hours,
                        totalVacationLeave: filteredData[0].totalVacationLeave,
                        remainingVacationLeave: filteredData[0].remainingVacationLeave,
                        grantedVacationLeave: filteredData[0].grantedVacationLeave,
                        unpaidLeave_days: filteredData[0].unpaidLeave_days,
                        unpaidLeave_hours: filteredData[0].unpaidLeave_hours,
                        totalUnpaidLeave: filteredData[0].totalUnpaidLeave,
                        specialPersonalLeave: filteredData[0].specialPersonalLeave,
                        ordinationLeave: filteredData[0].ordinationLeave,
                        maternityLeave: filteredData[0].maternityLeave,
                        workInjuryLeave_days: filteredData[0].workInjuryLeave_days
                    };
                    this.newPhone = this.data_user.phone;
                } else {
                    alert('ไม่พบข้อมูลในระบบ');
                }
            } catch (error) {
                console.error(error);
            }
        }
        ,
        page(page) {
            const itemFooter1 = document.querySelector('.item-footer-active-1');
            const itemFooter2 = document.querySelector('.item-footer-active-2');
            const itemFooter3 = document.querySelector('.item-footer-active-3');
            const itemFooter4 = document.querySelector('.item-footer-active-4');
            const itemFooter5 = document.querySelector('.item-footer-active-5');

            // ตรวจสอบว่า element แต่ละอันไม่เป็น null ก่อนที่จะทำการเปลี่ยนสี
            if (itemFooter1) itemFooter1.style.backgroundColor = '#514EB3';
            if (itemFooter2) itemFooter2.style.backgroundColor = '#514EB3';
            if (itemFooter3) itemFooter3.style.backgroundColor = '#514EB3';
            if (itemFooter4) itemFooter4.style.backgroundColor = '#514EB3';
            if (itemFooter5) itemFooter5.style.backgroundColor = '#514EB3';

            // ปรับสี footer ตาม page ที่เลือก
            if (page === 1 && itemFooter1) {
                itemFooter1.style.backgroundColor = '#9880F9';
            }
            if (page === 2 && itemFooter2) {
                itemFooter2.style.backgroundColor = '#9880F9';
            }
            if (page === 3 && itemFooter3) {
                itemFooter3.style.backgroundColor = '#9880F9';
            }
            if (page === 4 && itemFooter4) {
                itemFooter4.style.backgroundColor = '#9880F9';
            }
            if (page === 5 && itemFooter5) {
                itemFooter5.style.backgroundColor = '#9880F9';
            }
        }

    },
    mounted() {

        this.pages = this.$route.params.id

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
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active ใน Vue 2.1.8+ */
    {
    opacity: 0;
}


.box {
    background: rgba(184, 160, 222, 0.2);
    border-radius: 7px;
    padding: 10px;
    margin-top: 10px;
    transition: all 0.3s ease-in-out;
}


.button-detail {
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
    /* transition: all 0.3s ease-in-out; */
}


/*  */
.background {
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
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 0;
        top: -50px;
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

    .footer-home {
        position: fixed;
        bottom: 0;
        left: 1;
        z-index: 999;
        height: 60px;

        width: 100%;

        .item-footer {
            /* ลบขอบปุ่ม */
            border: none;
            background-color: #514EB3;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
        }

        .item-footer-active-1 {
            background-color: #514EB3;
        }

        .item-footer-active-2 {
            background-color: #514EB3;
        }

        .item-footer-active-3 {
            background-color: #514EB3;
        }

        .item-footer-active-4 {
            background-color: #514EB3;
        }

        .item-footer-active-5 {
            background-color: #514EB3;
        }

        .img-menu-1 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }

        .img-menu-2 {
            width: 100%;
            margin-top: 10px;
            margin-bottom: 5px;
            width: auto;
            height: 20px;
        }

        .img-menu-3 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }

        .img-menu-4 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }

        .img-menu-5 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }



    }

    .p-admin {
        font-size: 11px;
    }

}
</style>
