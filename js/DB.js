// js/DB.js
if (typeof window._HYGIE_URL === 'undefined') {
    // ใช้ค่า URL และ KEY ล่าสุดจากโปรเจกต์ของคุณ
    window._HYGIE_URL = 'https://yqlbdwfcnffjuzjznrbi.supabase.co';
    window._HYGIE_KEY = 'sb_publishable_JFvzaU8LuSa8KzL7o7Fmaw_J4oergY7';
    window._client = window.supabase.createClient(window._HYGIE_URL, window._HYGIE_KEY);
}

const db = {
    currentUser: null,
    currentRole: null,

    init: async function() {
        console.log("HygieGo System Initializing...");
        const storedUser = localStorage.getItem('hygieUser');
        const storedRole = localStorage.getItem('hygieRole');

        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                this.currentRole = storedRole;
            } catch (e) {
                console.error("Error parsing stored user", e);
                localStorage.clear();
            }
        }

        // Logic ป้องกันการเข้า Dashboard
        if (window.location.pathname.includes("dashboard.html")) {
            if (!this.currentUser) {
                window.location.href = '../auth/login.html'; // กลับไปหน้า Login แทนหน้า Index เพื่อความชัดเจน
            } else if (this.currentRole === 'user' && this.currentUser.payment_status !== 'paid') {
                Swal.fire({
                    icon: 'warning',
                    title: 'ยังไม่พบการชำระเงิน',
                    text: 'กรุณาเลือกซื้อแพ็คเกจเพื่อเปิดใช้งานระบบจัดการครับ',
                    confirmButtonColor: '#00C3AA',
                    confirmButtonText: 'ดูแพ็คเกจราคา',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = '../pricing.html';
                });
            }
        }
    },

    // ฟังก์ชัน Login: เปลี่ยน 'Users' เป็น 'users' (ตัวพิมพ์เล็ก)
    login: async function(email, password) {
        try {
            const { data, error } = await window._client
                .from('users') // แก้จาก 'Users' เป็น 'users' เพื่อป้องกัน Error 404
                .select('*')
                .eq('email', email)
                .eq('password_hash', password)
                .maybeSingle(); // ใช้ maybeSingle เพื่อป้องกัน error กรณีไม่พบข้อมูล

            if (error || !data) {
                return { success: false, msg: 'ไม่พบผู้ใช้งานหรือรหัสผ่านผิด' };
            }

            // บันทึกลง LocalStorage
            localStorage.setItem('hygieUser', JSON.stringify(data));
            localStorage.setItem('hygieRole', data.role || 'user');
            
            // ส่ง role กลับไปเพื่อให้หน้า login.html ทำการ redirect ได้ถูกต้อง
            return { success: true, user: data, role: data.role || 'user' };
            
        } catch (err) {
            console.error("Login unexpected error:", err);
            return { success: false, msg: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' };
        }
    }
};

export default db;