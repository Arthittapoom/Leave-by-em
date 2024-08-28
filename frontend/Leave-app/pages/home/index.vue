<template>
    <div class="background">
        <div class="from-login mt-5">
            <img class="logo" src="../../static/login/logo.svg" alt="">
            <div class="card pt-4 pb-4 pl-5 pr-5">
                <div class="p-canter">
                    <p>ชื่อ-นามสกุล : นาย ณัฐเศรษฐ เทพพิบูล</p>

                    <div class="box">
                        <p>รหัสพนักงาน : WM59001C</p>
                        <p>ตำแหน่ง : Chief Executive Officer</p>
                    </div>
                </div>
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

.box{
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

    img{
        width: 100px;
        height: 100px;
        background-color: #FFFFFF;
        position: relative;
        z-index: 1;
        top : 0px;
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
    

}

</style>
