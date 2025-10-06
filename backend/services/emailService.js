const transporter = require('../config/email');

class EmailService {
  /**
   * ส่งอีเมลแจ้งเตือนนัดหมายใหม่
   */
  async sendAppointmentCreatedEmail(appointment, recipient) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@appointment-system.com',
      to: recipient.email,
      subject: '🔔 มีนัดหมายใหม่',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📅 มีนัดหมายใหม่</h2>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดนัดหมาย</h3>
            <p><strong>หัวข้อ:</strong> ${appointment.title || 'ไม่ระบุ'}</p>
            <p><strong>วันที่:</strong> ${new Date(appointment.date).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>เวลา:</strong> ${appointment.time} น.</p>
            <p><strong>สถานที่:</strong> ${appointment.location}</p>
            ${appointment.notes ? `<p><strong>หมายเหตุ:</strong> ${appointment.notes}</p>` : ''}
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ ส่งอีเมลนัดหมายใหม่สำเร็จ:', recipient.email);
      return true;
    } catch (error) {
      console.error('❌ ส่งอีเมลนัดหมายใหม่ล้มเหลว:', error.message);
      return false;
    }
  }

  /**
   * ส่งอีเมลแจ้งเตือนนัดหมายถูกยืนยัน
   */
  async sendAppointmentConfirmedEmail(appointment, recipient) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@appointment-system.com',
      to: recipient.email,
      subject: '✅ นัดหมายได้รับการยืนยันแล้ว',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>✅ นัดหมายได้รับการยืนยันแล้ว</h2>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดนัดหมาย</h3>
            <p><strong>หัวข้อ:</strong> ${appointment.title || 'ไม่ระบุ'}</p>
            <p><strong>วันที่:</strong> ${new Date(appointment.date).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>เวลา:</strong> ${appointment.time} น.</p>
            <p><strong>สถานที่:</strong> ${appointment.location}</p>
          </div>
        </div>
      `
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ ส่งอีเมลปฏิเสธนัดหมายสำเร็จ:', recipient.email);
      return true;
    } catch (error) {
      console.error('❌ ส่งอีเมลปฏิเสธนัดหมายล้มเหลว:', error.message);
      return false;
    }

  }

  /**
   * ส่งอีเมลแจ้งเตือนนัดหมายถูกปฏิเสธ
   */
  async sendAppointmentRejectedEmail(appointment, recipient) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@appointment-system.com',
      to: recipient.email,
      subject: '❌ นัดหมายถูกปฏิเสธ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>❌ นัดหมายถูกปฏิเสธ</h2>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดนัดหมาย</h3>
            <p><strong>หัวข้อ:</strong> ${appointment.title || 'ไม่ระบุ'}</p>
            <p><strong>วันที่:</strong> ${new Date(appointment.date).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>เวลา:</strong> ${appointment.time} น.</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ ส่งอีเมลปฏิเสธนัดหมายสำเร็จ:', recipient.email);
      return true;
    } catch (error) {
      console.error('❌ ส่งอีเมลปฏิเสธนัดหมายล้มเหลว:', error.message);
      return false;
    }
  }

  /**
   * ส่งอีเมลแจ้งเตือนมีการแก้ไขนัดหมาย
   */
  async sendAppointmentUpdatedEmail(appointment, recipient) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@appointment-system.com',
      to: recipient.email,
      subject: '🔄 นัดหมายมีการเปลี่ยนแปลง',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🔄 นัดหมายมีการเปลี่ยนแปลง</h2>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดนัดหมายใหม่</h3>
            <p><strong>หัวข้อ:</strong> ${appointment.title || 'ไม่ระบุ'}</p>
            <p><strong>วันที่:</strong> ${new Date(appointment.date).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>เวลา:</strong> ${appointment.time} น.</p>
            <p><strong>สถานที่:</strong> ${appointment.location}</p>
            ${appointment.notes ? `<p><strong>หมายเหตุ:</strong> ${appointment.notes}</p>` : ''}
          </div>
          
          <p style="font-weight: bold;">กรุณายืนยันการเปลี่ยนแปลงนัดหมาย</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments" 
             style="display: inline-block; background: #333; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
            ยืนยันการเปลี่ยนแปลง
          </a>
          
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ ส่งอีเมลแจ้งการเปลี่ยนแปลงสำเร็จ:', recipient.email);
      return true;
    } catch (error) {
      console.error('❌ ส่งอีเมลแจ้งการเปลี่ยนแปลงล้มเหลว:', error.message);
      return false;
    }
  }

  /**
   * ส่งอีเมลเตือนนัดหมายใกล้เวลา
   */
  async sendAppointmentReminderEmail(appointment, recipient) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@appointment-system.com',
      to: recipient.email,
      subject: '⏰ เตือน: นัดหมายของคุณใกล้เวลาแล้ว',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>⏰ เตือน: นัดหมายของคุณใกล้เวลาแล้ว</h2>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0;">นัดหมายวันพรุ่งนี้</h3>
            <p><strong>หัวข้อ:</strong> ${appointment.title || 'ไม่ระบุ'}</p>
            <p><strong>วันที่:</strong> ${new Date(appointment.date).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>เวลา:</strong> ${appointment.time} น.</p>
            <p><strong>สถานที่:</strong> ${appointment.location}</p>
          </div>
          
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ ส่งอีเมลเตือนนัดหมายสำเร็จ:', recipient.email);
      return true;
    } catch (error) {
      console.error('❌ ส่งอีเมลเตือนนัดหมายล้มเหลว:', error.message);
      return false;
    }
  }

  /**
   * ส่งอีเมลแจ้งการยกเลิกนัดหมาย
   */
  async sendAppointmentCancelledEmail(appointment, recipient) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@appointment-system.com',
      to: recipient.email,
      subject: '🚫 นัดหมายถูกยกเลิก',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🚫 นัดหมายถูกยกเลิก</h2>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0;">นัดหมายที่ถูกยกเลิก</h3>
            <p><strong>หัวข้อ:</strong> ${appointment.title || 'ไม่ระบุ'}</p>
            <p><strong>วันที่:</strong> ${new Date(appointment.date).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>เวลา:</strong> ${appointment.time} น.</p>
          </div>
          
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ ส่งอีเมลยกเลิกนัดหมายสำเร็จ:', recipient.email);
      return true;
    } catch (error) {
      console.error('❌ ส่งอีเมลยกเลิกนัดหมายล้มเหลว:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();

