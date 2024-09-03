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
            <HomePage v-if="this.$route.params.id === 'home'"/>
            <LeaveAbsence v-if="this.$route.params.id === 'leaveabsence'" />
            <LeaveOutside v-if="this.$route.params.id === 'leaveoutside'" />
            <ResignFromWork v-if="this.$route.params.id === 'resignfromwork'" />
            <ListRequests v-if="this.$route.params.id === 'listrequests'" />
            
            
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
            pageuserDetail: false
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
                    this.newPhone = this.data_user.phone;
                } else {
                    alert('ไม่พบข้อมูลในระบบ');
                }
            } catch (error) {
                console.error(error);
            }
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
}
</style>
