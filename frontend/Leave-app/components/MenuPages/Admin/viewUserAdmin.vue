<template>
    <div class="form-container">
        <h2>สร้างผู้ดูและระบบ</h2>
        <form @submit.prevent="updateUser">
            <!-- Username -->
            <div class="form-group">
                <label for="username">ชื่อผู้ใช้งาน *</label>
                <input type="text" id="username" v-model="user.username" placeholder="กรอกชื่อผู้ใช้งาน" required />
            </div>

            <!-- Full Name -->
            <div class="form-group">
                <label for="fullname">ชื่อ-นามสกุล *</label>
                <input type="text" id="fullname" v-model="user.fullname" placeholder="กรอกชื่อ-นามสกุล" required />
            </div>

            <!-- Email -->
            <div class="form-group">
                <label for="email">อีเมล *</label>
                <input type="email" id="email" v-model="user.email" placeholder="กรอกอีเมล" required />
            </div>

            <!-- Phone -->
            <div class="form-group">
                <label for="phone">เบอร์โทร *</label>
                <input type="tel" id="phone" v-model="user.phone" placeholder="กรอกเบอร์โทร" required />
            </div>

            <!-- Password -->
            <div class="form-group">
                <label for="password">รหัสผ่าน *</label>
                <input type="password" id="password" v-model="user.password" placeholder="กรอกรหัสผ่าน" required />
            </div>

            <!-- Role -->
            <div class="form-group">
                <label for="role">หน้าที่ *</label>
                <select id="role" v-model="user.role" required>
                    <option disabled value="">เลือกหน้าที่</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <!-- Add more roles as needed -->
                </select>
            </div>

            <!-- Buttons -->
            <div class="form-buttons">
                <button type="button" @click="cancel" class="cancel-btn">ย้อนกลับ</button>
                <button type="submit" class="create-btn">บันทึก</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    props: ['users'],
    data() {
        return {
            user: {
                username: this.users.username,
                fullname: this.users.fullname,
                email: this.users.email,
                phone: this.users.phone,
                password: "*********",
                role: this.users.role,
            },
        };
    },
    methods: {
        updateUser() {
            this.$emit('updateUserAdmin', this.user);
        },
        cancel() {
            this.$emit('closeViewUserAdmin');
        },

    },
    mounted() {

    },

};
</script>

<style scoped>
/* Form Container */
.form-container {
    width: 700px;
    margin-left: 250px;
    padding: 60px 20px;
    font-family: 'Arial', sans-serif;

    /* อยู่ซ้ายสุด */
    position: absolute;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    font-weight: normal;
    font-size: 1.5rem;
}

/* Form Group with Flexbox */
.form-group {
    display: flex;
    align-items: center;
    margin-bottom: 20px;


}

label {
    width: 30%;
    margin-right: -60px;
    font-weight: bold;
    font-size: 14px;
    color: #000;
    text-align: left;
}

input,
select {
    width: 70%;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 30px;
    font-size: 14px;
    outline: none;
    height: 50px;

}

input::placeholder {
    color: #cfcfcf;
}

select {
    appearance: none;
    background-color: #fff;
}

select:focus {
    border-color: #007bff;
}

/* Form Buttons */
.form-buttons {
    display: flex;
    justify-content: flex-end;
    position: relative;
    right: 60px;
    margin-top: 30px;
}

button {
    padding: 10px 30px;
    border-radius: 30px;
    font-size: 16px;
    border: none;
    cursor: pointer;
}

.cancel-btn {
    background-color: #f5f5f5;
    color: #555;
    margin-right: 10px;
}

.create-btn {
    background-color: #00bfa5;
    color: white;
}

.create-btn:hover,
.cancel-btn:hover {
    opacity: 0.8;
}

/* Specific Button Styling */
.cancel-btn:hover {
    background-color: #e5e5e5;
}

.create-btn:hover {
    background-color: #00897b;
}
</style>