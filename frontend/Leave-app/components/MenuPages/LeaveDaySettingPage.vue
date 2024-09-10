<template>
    <div>
      <!-- <h2>Upload File</h2> -->
      <input type="file" @change="handleFileUpload" />
      <button @click="uploadFile">Upload</button>
      <div v-if="uploadStatus">{{ uploadStatus }}</div>
    </div>
  </template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      selectedFile: null,
      uploadStatus: ''
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (!this.selectedFile) {
        this.uploadStatus = 'Please select a file first.';
        return;
      }

      const formData = new FormData();
      formData.append('files', this.selectedFile);

      const config = {
        method: 'post',
        url: process.env.API_URL + '/master/migrate-data',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      };

      axios.request(config)
        .then((response) => {
          this.uploadStatus = 'File uploaded successfully!';
          console.log(response.data);
        })
        .catch((error) => {
          this.uploadStatus = 'File upload failed. Please try again.';
          console.error(error);
        });
    }
  }
};
</script>


<style scoped>
h2 {
  font-family: Arial, sans-serif;
}

input[type="file"] {
  margin: 10px 0;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

div {
  margin-top: 20px;
  font-family: Arial, sans-serif;
  color: #333;
}
</style>
