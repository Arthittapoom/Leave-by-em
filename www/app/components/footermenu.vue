<!-- <template>
    <div>
        <div class="footer-home row">
                <button @click="pages = 'leaveabsence'; page(1)" class="col item-footer item-footer-active-1">
                    <img class="img-menu-1" src="../../static/home/menu-1.png" alt="">
                    <p>ลาหยุด</p>
                </button>
                <button @click="pages = 'leaveoutside'; page(2)" class="col item-footer item-footer-active-2">
                    <img class="img-menu-2" src="../../static/home/menu-2.png" alt="">
                    <p>นอกสถานที่</p>
                </button>
                <button @click="pages = 'leaveoutside'; page(2)" class="col item-footer item-footer-active-2">
                    <img class="img-menu-2" src="../../static/home/menu-2.png" alt="">
                    <p>นอกสถานที่</p>
                </button>
                <button @click="pages = 'resignfromwork'; page(3)" class="col item-footer item-footer-active-3">
                    <img class="img-menu-3" src="../../static/home/menu-3.png" alt="">
                    <p>ลาออก</p>
                </button>
                <button @click="pages = 'home'; page(4)" class="col item-footer item-footer-active-4">
                    <img class="img-menu-4" src="../../static/home/menu-4.png" alt="">
                    <p>โปรไฟล</p>
                </button>
            </div>
    </div>
</template>

<script>
    export default {
        methods: {
            page(page) {
            document.querySelector('.item-footer-active-1').style.backgroundColor = '#514EB3';
            document.querySelector('.item-footer-active-2').style.backgroundColor = '#514EB3';
            document.querySelector('.item-footer-active-3').style.backgroundColor = '#514EB3';
            document.querySelector('.item-footer-active-4').style.backgroundColor = '#514EB3';

            // ปรับสี footer
            if (page === 1) {
                document.querySelector('.item-footer-active-1').style.backgroundColor = '#9880F9';
            }
            if (page === 2) {
                document.querySelector('.item-footer-active-2').style.backgroundColor = '#9880F9';
            }
            if (page === 3) {
                document.querySelector('.item-footer-active-3').style.backgroundColor = '#9880F9';
            }
            if (page === 4) {
                document.querySelector('.item-footer-active-4').style.backgroundColor = '#9880F9';
            }
        }
        }
    }
</script>

<style scoped>
    .footer-home {
        position: fixed;
        bottom: 0;
        left: 1;
        z-index: 999;
        height: 60px;

        width: 100%;

        .item-footer {
            /* ลบขอบปุ่ม */
            border: none;
            background-color: #514EB3;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
        }

        .item-footer-active-1 {
            background-color: #514EB3;
        }

        .item-footer-active-2 {
            background-color: #514EB3;
        }

        .item-footer-active-3 {
            background-color: #514EB3;
        }

        .item-footer-active-4 {
            background-color: #514EB3;
        }

        .img-menu-1 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }

        .img-menu-2 {
            width: 100%;
            margin-top: 10px;
            margin-bottom: 5px;
            width: auto;
            height: 20px;
        }

        .img-menu-3 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }

        .img-menu-4 {
            width: 100%;
            margin-top: 5px;
            width: auto;
            height: 25px;
        }



    }
</style> -->