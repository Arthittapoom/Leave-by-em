<template>
  <div>
    <!-- ไม่จำเป็นต้องมี UI ใด ๆ ที่นี่ก็ได้ -->
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
      if (!this.$liff.isLoggedIn()) {
        this.$liff.login()
      } else {
        try {
          this.profile = await this.$liff.getProfile()
          // แสดงข้อมูลผู้ใช้ (อาจใช้ในที่อื่น เช่น บนหน้าเว็บ)
          console.log('Profile:', this.profile)
          // ส่งไปที่หน้า '/login'
          this.$router.push('/login')
        } catch (error) {
          console.error('Error getting profile:', error)
        }
      }
    }
  },
  mounted() {
    this.loginWithLINE() // เรียกใช้งานฟังก์ชัน loginWithLINE เมื่อคอมโพเนนต์ถูกสร้างเสร็จ
  }
}
</script>
