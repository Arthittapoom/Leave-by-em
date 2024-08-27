<template>
    <div class="background">
        <div class="from-login mt-5">
            <img class="logo" src="../../static/login/logo.svg" alt="">
            <p>ลงทะเบียน</p>
            <div class="card pt-4 pb-4 pl-5 pr-5">
                <div class="p-canter">
                    <p>กรอกรหัสพนักงาน</p>
                </div>
                <input type="text" name="code_id" v-model="code_id"  id="">
                <button @click="getdata(code_id)" >เรียกข้อมูลพนักงาน</button>
                <div class="div-p-canter" v-if="!data_user.name == ''">
                    <!-- ชื่อ-นามสกุล อยู่ตรงกลาง --> 
                    <p class="mt-3" >ชื่อ-นามสกุล</p>
                     <input type="text" name="" :value="data_user.name"  id="" readonly>
    
                     <!-- ชื่อเล่น -->
                    <p class="mt-1">ชื่อเล่น</p>
                     <input type="text" name="" :value="data_user.nickname"  id="" readonly>
    
                     <!-- สังกัด -->
                    <p class="mt-1">สังกัด</p>
                     <input type="text" name="" :value="data_user.department"  id="" readonly>
                      <!-- รหัสพนักงาน -->
                    <p class="mt-1">รหัสพนักงาน</p>
                     <input type="text" name="" :value="data_user.code_id"  id="" readonly>
                       <!-- ตำแหน่ง -->
                    <p class="mt-1">ตำแหน่ง</p>
                     <input type="text" name="" :value="data_user.position"  id="" readonly>
                        <!-- ประเภทพนักงาน -->
                    <p class="mt-1">ประเภทพนักงาน</p>
                     <input type="text" name="" :value="data_user.type"  id="" readonly>
                         <!-- ฝ่าย -->
                    <p class="mt-1">ฝ่าย</p>
                     <input type="text" name="" :value="data_user.division"  id="" readonly>
                          <!-- สถานที่ปฏิบัติงาน -->
                    <p class="mt-1">สถานที่ปฏิบัติงาน</p>
                     <input type="text" name="" :value="data_user.workplace"  id="" readonly>
                          <!-- อายุงาน -->
                    <p class="mt-1">อายุงาน</p>
                     <input type="text" name="" :value="data_user.years"  id="" readonly>
                           <!-- เบอร์โทรศัพท์ -->
                    <p class="mt-1">เบอร์โทรศัพท์</p>
                     <input type="text" name="" :value="data_user.phone"  id="" >
    
                    </div>
                    <button v-if="!data_user.name == ''" @click="register(data_user)">ลงทะเบียน</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // profile: null, // displayName // pictureUrl // statusMessage // userId
            code_id: '',
            data_user: {}

        }
    },
    methods: {
        async loginWithLINE() {
            if (!this.$liff.isLoggedIn()) {
                this.$liff.login()
            } else {
                try {
                    this.profile = await this.$liff.getProfile()
                    // console.log('Profile:', this.profile)
                } catch (error) {
                    console.error('Error getting profile:', error)
                }
            }
        },
        getdata(id) {

            let data = {
                id: id,
                name: 'นาย ณัฐเศรษฐ เทพพิบูล',
                nickname: 'แทค',
                department: 'WM',
                code_id: 'WM59001C',
                position: 'Chief Executive Officer ',
                type: 'พนักงานรายเดือน',
                division: 'Committee',
                workplace: 'BKK',
                years: '1/11/2021 - 28/2/2022',
                phone: 'เบอร์โทรศัพท์'

            }

            this.data_user = data

            // alert('ดึงข้อมูลเรียบร้อย'+id)
        },
        register(data_user) {
            alert('ดึงข้อมูลเรียบร้อย ID ' + data_user.id)
        }
    },
    mounted() {
        // this.loginWithLINE()
    }
}
</script>

<style scoped>

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

    img{
        width: 200px;
    }

    .card {
        box-sizing: border-box;
        background: #FFFFFF;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 19px;
        /* อยู่ตรงกลาง */
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .p-canter {
        display: flex;
        flex-direction: column;
        align-items: center;

    }

    .div-p-canter{
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
        box-sizing: border-box;
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
