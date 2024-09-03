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
        await this.$router.push('/login')
        return
      }
      if (!this.$liff.isLoggedIn()) {
       await this.$liff.login()
      } else {
        try {

         this.profile = await this.$liff.getProfile()

         await localStorage.setItem('profile', JSON.stringify(this.profile))

         await this.$router.push('/login')
      
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
