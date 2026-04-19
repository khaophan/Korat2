import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 class="text-lg font-semibold text-white mb-4">ข้อมูลโครงการ</h3>
            <p class="text-sm mb-2 leading-relaxed">การพัฒนาเว็บแอปพลิเคชันแผนที่เส้นทางรถสองแถวประจำทางอำเภอเมืองนครราชสีมา พร้อมระบบ Admin และระบบรายงานปัญหา</p>
            <p class="text-sm mb-2">โครงงาน IS โรงเรียนจักราชวิทยา จ.นครราชสีมา</p>
            <p class="text-sm">ภาคเรียนที่ 2 ปีการศึกษา 2567</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white mb-4">คณะผู้จัดทำ</h3>
            <ul class="text-sm space-y-2">
              <li>1. นาย กฤตานนท์ เพียรงาน</li>
              <li>2. นางสาว ปภาวรินทร์ สุขสวัสดิ์</li>
              <li>3. นาย ธนกฤต วงศ์ประเสริฐ</li>
              <li>4. นางสาว อรณิชา ทองดีเลิศ</li>
              <li>5. นาย พัชรพล ศรีวิชัย</li>
            </ul>
            <h4 class="text-sm font-semibold text-white mt-6 mb-2">ครูที่ปรึกษา</h4>
            <p class="text-sm">นาย สมชาย รัตนพงศ์ / นางสาว วรรณิภา เจริญสุข</p>
          </div>
        </div>
        <div class="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          &copy; 2024 Korat Songthaew Map. All rights reserved.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
