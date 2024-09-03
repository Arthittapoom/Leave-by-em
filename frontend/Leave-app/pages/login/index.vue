<template>
    <div class="background">
        <div class="form-login mt-5">
            <img class="logo" src="../../static/login/logo.svg" alt="">
            <p>ลงทะเบียน</p>
            <div class="card pt-4 pb-4 pl-5 pr-5">
                <div class="p-center">
                    <p>กรอกรหัสพนักงาน</p>
                </div>
                <input type="text" name="code_id" v-model="code_id" id="">
                <button @click="getdata(code_id)">เรียกข้อมูลพนักงาน</button>
                <div class="div-p-center" v-if="data_user.name">
                    <!-- ชื่อ-นามสกุล อยู่ตรงกลาง -->
                    <p class="mt-3">ชื่อ-นามสกุล</p>
                    <input type="text" name="" v-model="data_user.name" id="" readonly>

                    <!-- ชื่อเล่น -->
                    <p class="mt-1">ชื่อเล่น</p>
                    <input type="text" name="" v-model="data_user.nickname" id="" readonly>

                    <!-- สังกัด -->
                    <p class="mt-1">สังกัด</p>
                    <input type="text" name="" v-model="data_user.department" id="" readonly>

                    <!-- รหัสพนักงาน -->
                    <p class="mt-1">รหัสพนักงาน</p>
                    <input type="text" name="" v-model="data_user.code_id" id="" readonly>

                    <!-- ตำแหน่ง -->
                    <p class="mt-1">ตำแหน่ง</p>
                    <input type="text" name="" v-model="data_user.position" id="" readonly>

                    <!-- ประเภทพนักงาน -->
                    <p class="mt-1">ประเภทพนักงาน</p>
                    <input type="text" name="" v-model="data_user.type" id="" readonly>

                    <!-- ฝ่าย -->
                    <p class="mt-1">ฝ่าย</p>
                    <input type="text" name="" v-model="data_user.division" id="" readonly>

                    <!-- สถานที่ปฏิบัติงาน -->
                    <p class="mt-1">สถานที่ปฏิบัติงาน</p>
                    <input type="text" name="" v-model="data_user.workplace" id="" readonly>

                    <!-- อายุงาน -->
                    <p class="mt-1">อายุงาน</p>
                    <input type="text" name="" v-model="data_user.years" id="" readonly>

                    <!-- เบอร์โทรศัพท์ -->
                    <p class="mt-1">เบอร์โทรศัพท์</p>
                    <input type="text" name="phone" v-model="newPhone" id="">
                </div>
                <button v-if="data_user.name" @click="register(data_user)">ลงทะเบียน</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            code_id: '',
            data_user: {},
            newPhone: ''
        };
    },
    methods: {
        async getdata(id) {
            try {
                let config = {
                    method: 'get',
                    url: `${process.env.API_URL}/users/getUsers`,
                };

                const response = await axios.request(config);

                const filteredData = response.data.filter(item => item.code === this.code_id);

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
                        phone: filteredData[0].phone
                    };
                    this.newPhone = this.data_user.phone; // ตั้งค่าเบอร์โทรศัพท์ใหม่
                } else {
                    alert('ไม่พบข้อมูลในระบบ');
                }
            } catch (error) {
                console.error(error);
            }
        },
        async register(data_user) {
            const profileData = localStorage.getItem('profile');
            const line_id = profileData ? JSON.parse(profileData).userId : null;

            if (!this.newPhone) {
                alert('กรุณากรอกเบอร์โทรศัพท์');
                return;
            }

            try {
                let data = JSON.stringify({
                    "lineId": line_id,
                    "phone": this.newPhone
                });

                let config = {
                    method: 'put',
                    url: `${process.env.API_URL}/users/updateUser/${data_user.id}`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                };

                const response = await axios.request(config);
                // console.log(response.data);

                this.$router.push('/home')
            } catch (error) {
                console.error(error);
            }
        }
    }
};
</script>

<style scoped>
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

.form-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 50px;

    img {
        width: 200px;
    }

    .card {
        box-sizing: border-box;
        background: #FFFFFF;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 19px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .p-center {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .div-p-center {
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    p {
        font-weight: 300;
        font-size: 20px;
    }

    input {
        box-sizing: border-box;
        border: 1px solid #5C5C5C;
        border-radius: 30px;
        width: 276.47px;
        height: 34px;
        margin-bottom: 10px;
        padding-left: 10px;
    }

    button {
        color: #ffffff;
        background: #330066;
        border-radius: 40px;
        width: 121px;
        height: 31px;
        margin-top: 10px;
    }
}
</style>
