<template>
    <div class="bg-image">
      <div class="login-container">
        <div class="login-box">
          <!-- Welcome Text -->
          <div class="welcome-text">
            <h1>ยินดีต้อนรับ</h1>
            <p>ลงชื่อเข้าสู่ระบบ</p>
          </div>
  
          <!-- Input Fields -->
          <form @submit.prevent="login">
            <div class="input-group">
              <label for="username">ชื่อผู้ใช้</label>
              <input type="text" v-model="username" id="username" placeholder="ชื่อผู้ใช้" required />
            </div>
  
            <div class="input-group">
              <label for="password">รหัสผ่าน</label>
              <input type="password" v-model="password" id="password" placeholder="********" required />
              <span class="toggle-password" @click="togglePasswordVisibility">
                <i :class="passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </span>
            </div>
  
            <!-- Forgot Password -->
            <p class="forgot-password">ลืมรหัสผ่าน ?</p>
  
            <!-- Submit Button -->
            <button type="submit" class="login-btn">เข้าสู่ระบบ</button>
          </form>
        </div>
  
        <!-- Right Side with Logo -->
        <div class="logo-box">
          <img src="../../static/admin/logo.png" alt="Work Motion Logo" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: '',
        passwordVisible: false,
      };
    },
    methods: {
      togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
        const passwordInput = document.getElementById('password');
        passwordInput.type = this.passwordVisible ? 'text' : 'password';
      },
      login() {
        // Perform login action here
        this.$router.push('/admin');
      },
    },
  };
  </script>
  
  <style scoped>
  .bg-image {
    /* background-image: url('../../static/admin/background.png');*/
    background-color: #5a2e8e;
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .login-container {
    display: flex;
    width: 70%;
    height: 80%;
    background-color: white;
    border-radius: 15px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .login-box {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 50px;
  }
  
  .welcome-text {
    text-align: center;
  }
  
  h1 {
    font-size: 32px;
    color: #5a2e8e;
  }
  
  p {
    color: #5a2e8e;
    font-size: 18px;
  }
  
  .input-group {
    margin: 20px 0;
  }
  
  label {
    font-size: 16px;
    color: #5a2e8e;
  }
  
  input {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  }
  
  input:focus {
    outline: none;
    border-color: #5a2e8e;
  }
  
  .toggle-password {
    position: absolute;
    right: 15px;
    top: 45px;
    cursor: pointer;
  }
  
  .forgot-password {
    text-align: right;
    color: #5a2e8e;
    font-size: 14px;
    cursor: pointer;
  }
  
  .login-btn {
    width: 100%;
    padding: 10px;
    background-color: #5a2e8e;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    cursor: pointer;
    margin-top: 20px;
  }
  
  .logo-box {
    width: 50%;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top-right-radius: 15px;
    border-bottom-right-radius: 15px;
  }
  
  img {
    max-width: 250px;
  }
  
  @media (max-width: 768px) {
    .login-container {
      flex-direction: column;
      height: auto;
    }
  
    .login-box, .logo-box {
      width: 100%;
      border-radius: 0;
    }
  }
  </style>
  