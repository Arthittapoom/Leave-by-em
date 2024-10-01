<template>
  <div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      profile: null
    }
  },
  methods: {
    async loginWithLINE() {
      if (localStorage.getItem('profile')) {
        this.profile = JSON.parse(localStorage.getItem('profile'))

          // ตรวจสอบว่าเปิดในคอมพิวเตอร์หรือไม่
          if (navigator.userAgent.indexOf('Mobile') === -1) {
            await this.$router.push('/login-admin')

            // console.log("อยู่ในคอมพิวเตอร์")
          } else {
            await this.$router.push('/home/home')

            // await this.$router.push('/login')
            // console.log("ไม่อยู่ในคอมพิวเตอร์")
          }

        return
      }
      if (!this.$liff.isLoggedIn()) {
        await this.$liff.login()
      } 
      else {
        try {

          this.profile = await this.$liff.getProfile()

          await localStorage.setItem('profile', JSON.stringify(this.profile))

          if (navigator.userAgent.indexOf('Mobile') === -1) {
            await this.$router.push('/login-admin')
            // console.log("อยู่ในคอมพิวเตอร์")
          } else {
            await this.$router.push('/login')
            // console.log("ไม่อยู่ในคอมพิวเตอร์")
          }

        } catch (error) {
          console.error('Error getting profile:', error)
        }
      }
    }
  },
  mounted() {
    this.loginWithLINE()
  }
}
</script>
