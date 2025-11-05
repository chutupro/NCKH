import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { validate as deepValidate } from 'deep-email-validator';
import axios from 'axios';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    // Cấu hình SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.config.get<number>('SMTP_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.config.get<string>('SMTP_USER'), // Email gửi
        pass: this.config.get<string>('SMTP_PASS'), // App password
      },
    });
  }

  // Send OTP email to user
  async sendOTPEmail(email: string, otpCode: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> {
    try {
      console.log('🔵 [EmailService] Attempting to send OTP email...');
      console.log('📧 To:', email);
      console.log('🔑 OTP Code:', otpCode);
      console.log('📮 SMTP Config:', {
        host: this.config.get<string>('SMTP_HOST'),
        port: this.config.get<number>('SMTP_PORT'),
        user: this.config.get<string>('SMTP_USER'),
        hasPassword: !!this.config.get<string>('SMTP_PASS'),
      });

      const mailOptions = {
        from: `"DynaVault - Đà Nẵng History" <${this.config.get<string>('SMTP_USER')}>`,
        to: email,
        subject: 'Xác nhận đăng ký tài khoản DynaVault',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #4ecdc4; text-align: center; margin-bottom: 20px;">
                🐉 DynaVault - Đà Nẵng History
              </h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chào bạn,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Cảm ơn bạn đã tham gia <strong>DynaVault</strong>, nơi lưu giữ và chia sẻ kho tàng lịch sử Đà Nẵng!
                Để bắt đầu hành trình khám phá, vui lòng sử dụng mã OTP dưới đây:
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">Mã OTP của bạn:</p>
                <h1 style="color: white; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otpCode}
                </h1>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                ⏰ Hãy nhập mã này vào trang xác nhận trong vòng <strong>10 phút</strong> để hoàn tất đăng ký.<br>
                🔒 Mã OTP chỉ sử dụng một lần và vui lòng không chia sẻ để đảm bảo an toàn.
              </p>
              
              <p style="color: #999; font-size: 13px; font-style: italic; margin-top: 20px;">
                Nếu bạn không thực hiện đăng ký, hãy bỏ qua email này.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 13px; line-height: 1.6;">
                Cần hỗ trợ? Liên hệ qua <a href="mailto:support@dynavault.com" style="color: #4ecdc4;">support@dynavault.com</a>
              </p>
              
              <p style="color: #333; font-size: 14px; margin-top: 20px;">
                Trân trọng,<br>
                <strong style="color: #4ecdc4;">Đội ngũ DynaVault</strong> – Gìn giữ lịch sử, lan tỏa văn hóa Đà Nẵng
              </p>
            </div>
            
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              © 2025 DynaVault. All rights reserved.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EmailService] Email sent successfully! MessageID:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ [EmailService] Error sending email:');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        response: error.response,
        command: error.command
      });
      
      let errorMessage = 'Không thể gửi email. Vui lòng thử lại.';
      
      // Check for specific SMTP errors
      if (error.response || error.responseCode) {
        const response = error.response || '';
        const code = error.responseCode || 0;
        
        console.error('SMTP Error Response:', response);
        console.error('SMTP Error Code:', code);
        
        // Error 550 5.1.1: Recipient address rejected / User unknown / Mailbox not found
        if (code === 550 || response.includes('550') || response.includes('5.1.1') || response.toLowerCase().includes('user unknown')) {
          errorMessage = 'Email không tồn tại hoặc không thể nhận thư. Vui lòng kiểm tra lại địa chỉ email.';
        }
        // Error 553: Mailbox name not allowed / Invalid recipient
        else if (code === 553 || response.includes('553') || response.includes('5.1.3')) {
          errorMessage = 'Địa chỉ email không hợp lệ hoặc không được phép. Vui lòng kiểm tra lại.';
        }
        // Error 554: Transaction failed / Relay access denied
        else if (code === 554 || response.includes('554') || response.includes('5.7.1')) {
          errorMessage = 'Email bị từ chối bởi máy chủ. Vui lòng thử email khác.';
        }
        // Error 552: Mailbox full
        else if (code === 552 || response.includes('552') || response.includes('5.2.2')) {
          errorMessage = 'Hộp thư đích đã đầy. Vui lòng thử email khác.';
        }
      }
      
      console.error('📧 [EmailService] Email send failed:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // 🔥 NEW: Send Email Verification Link
  async sendVerificationEmail(
    email: string, 
    verificationLink: string, 
    fullName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔵 [EmailService] Sending verification email...');
      console.log('📧 To:', email);
      console.log('🔗 Link:', verificationLink);

      const mailOptions = {
        from: `"DynaVault - Đà Nẵng History" <${this.config.get<string>('SMTP_USER')}>`,
        to: email,
        subject: '✉️ Xác thực tài khoản DynaVault',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #4ecdc4; text-align: center; margin-bottom: 20px;">
                🐉 DynaVault - Đà Nẵng History
              </h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chào <strong style="color: #4ecdc4;">${fullName}</strong>,
              </p>
              
              <p style="color: #333; font-size: 14px; line-height: 1.6;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>DynaVault</strong> – nền tảng gìn giữ và lan tỏa văn hóa, lịch sử Đà Nẵng.
              </p>
              
              <p style="color: #333; font-size: 14px; line-height: 1.6;">
                Để hoàn tất đăng ký, vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; 
                          background-color: #4ecdc4; 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          font-size: 16px;
                          transition: background-color 0.3s;">
                  ✅ Xác thực Email
                </a>
              </div>
              
              <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 20px;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="${verificationLink}" style="color: #4ecdc4; word-break: break-all;">
                  ${verificationLink}
                </a>
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #856404; font-size: 13px; margin: 0;">
                  ⚠️ <strong>Lưu ý:</strong> Link xác thực có hiệu lực trong <strong>24 giờ</strong>. Nếu hết hạn, vui lòng đăng ký lại.
                </p>
              </div>
              
              <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 20px;">
                Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
              </p>
              
              <p style="color: #333; font-size: 14px; margin-top: 20px;">
                Trân trọng,<br>
                <strong style="color: #4ecdc4;">Đội ngũ DynaVault</strong> – Gìn giữ lịch sử, lan tỏa văn hóa Đà Nẵng
              </p>
            </div>
            
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              © 2025 DynaVault. All rights reserved.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EmailService] Verification email sent! MessageID:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ [EmailService] Error sending verification email:');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        response: error.response,
      });

      let errorMessage = 'Không thể gửi email xác thực. Vui lòng thử lại.';

      // Handle specific SMTP errors
      if (error.response || error.responseCode) {
        const response = error.response || '';
        const code = error.responseCode || 0;

        if (code === 550 || response.includes('550') || response.includes('5.1.1')) {
          errorMessage = 'Email không tồn tại hoặc không thể nhận thư. Vui lòng kiểm tra lại địa chỉ email.';
        } else if (code === 553 || response.includes('553')) {
          errorMessage = 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (code === 554 || response.includes('554')) {
          errorMessage = 'Email bị từ chối bởi máy chủ. Vui lòng thử email khác.';
        }
      }

      console.error('📧 [EmailService] Verification email failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Kiểm tra email có tồn tại thật không (deep validation + external API)
  async verifyEmailExists(email: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      console.log('🔍 [EmailService] Deep validating email:', email);
      
      // 1. Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('❌ Email format invalid:', email);
        return { valid: false, reason: 'Email không đúng định dạng.' };
      }

      // 2. Extract domain
      const domain = email.split('@')[1];
      if (!domain) {
        console.error('❌ No domain found in email:', email);
        return { valid: false, reason: 'Email không hợp lệ.' };
      }
      
      // 3. Blacklist common fake/test domains
      const fakeDomains = ['test.com', 'example.com', 'fake.com', 'invalid.com', 'asdasd.com', 'xyz.com'];
      if (fakeDomains.includes(domain.toLowerCase())) {
        console.error('❌ Blacklisted domain:', domain);
        return { valid: false, reason: 'Email sử dụng domain không được phép.' };
      }

      // 4. 🔥 NEW: External email validation (Hunter.io Email Verifier - FREE)
      // This can detect fake Gmail/Hotmail emails with high accuracy
      try {
        console.log('🌐 [EmailService] Checking email via Hunter.io...');
        const apiResponse = await axios.get(
          `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=free`,
          { 
            timeout: 8000,
            headers: { 'Accept': 'application/json' }
          }
        );

        const { data } = apiResponse.data;
        
        console.log('📊 Hunter.io result:', {
          email,
          result: data.result,
          score: data.score,
          status: data.status
        });

        // Hunter.io results: deliverable, undeliverable, risky, unknown
        if (data.result === 'undeliverable') {
          console.error('❌ Email marked as UNDELIVERABLE by Hunter.io');
          return {
            valid: false,
            reason: 'Email không tồn tại hoặc không thể nhận thư. Vui lòng kiểm tra lại địa chỉ email.'
          };
        }

        // Check score (0-100)
        if (data.score !== undefined && data.score < 30) {
          console.error(`❌ Email has low deliverability score: ${data.score}/100`);
          return {
            valid: false,
            reason: 'Email có vẻ không hợp lệ. Vui lòng kiểm tra lại địa chỉ email.'
          };
        }

        console.log('✅ Hunter.io validation passed');
      } catch (apiError) {
        console.error('⚠️ Hunter.io failed, trying alternative service:', apiError.message);
        
        // Fallback: EVA - Email Verification API (completely free, no key)
        try {
          console.log('🌐 [EmailService] Trying EVA (email-verify.my.id)...');
          const evaResponse = await axios.get(
            `https://email-verify.my.id/verify/${encodeURIComponent(email)}`,
            { timeout: 5000 }
          );

          console.log('📊 EVA result:', evaResponse.data);

          if (evaResponse.data.status === false || evaResponse.data.valid === false) {
            console.error('❌ Email marked as INVALID by EVA');
            return {
              valid: false,
              reason: 'Email không tồn tại hoặc không hợp lệ. Vui lòng kiểm tra lại.'
            };
          }

          console.log('✅ EVA validation passed');
        } catch (evaError) {
          console.error('⚠️ All external APIs failed, using local validation only:', evaError.message);
          // Continue with local validation
        }
      }

      // 5. Local deep validation (fallback)
      const validationResult = await deepValidate({
        email: email,
        validateRegex: true,
        validateMx: false, // ❌ TẮT MX CHECK - Gmail thường bị false negative
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: false, // Keep disabled - unreliable
      });

      console.log('📊 Deep validation result:', {
        email,
        valid: validationResult.valid,
        reason: validationResult.reason,
        validators: validationResult.validators
      });

      if (!validationResult.valid) {
        const failureReason = validationResult.reason || 'unknown';
        
        // Hard failures - definitely reject (regex, MX, disposable)
        const reason = this.translateValidationReason(failureReason);
        console.error('❌ Email validation failed:', email, '-', reason);
        return { valid: false, reason };
      }

      console.log('✅ Email validation passed:', email);
      return { valid: true };
    } catch (error) {
      console.error('❌ Email verification error for', email, ':', error.code || error.message);
      // On error, default to basic MX check fallback
      return await this.fallbackMxCheck(email);
    }
  }

  // Fallback to basic MX check if deep validation fails
  private async fallbackMxCheck(email: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const domain = email.split('@')[1];
      const dns = require('dns').promises;
      const mxRecords = await dns.resolveMx(domain);
      
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, reason: 'Email không thể nhận thư (không có MX records).' };
      }

      console.log('⚠️ Fallback MX check passed for', email);
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Email không hợp lệ hoặc không thể nhận thư.' };
    }
  }

  // ✅ NEW: Send Password Reset OTP Email
  async sendPasswordResetOTP(email: string, otpCode: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> {
    try {
      console.log('🔵 [EmailService] Sending password reset OTP to:', email);

      const mailOptions = {
        from: `"DynaVault - Đà Nẵng History" <${this.config.get<string>('SMTP_USER')}>`,
        to: email,
        subject: 'Đặt lại mật khẩu DynaVault',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #ff6b6b; text-align: center; margin-bottom: 20px;">
                🔒 Đặt lại mật khẩu
              </h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chào bạn,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>DynaVault</strong> của bạn.
                Vui lòng sử dụng mã OTP dưới đây để tiếp tục:
              </p>
              
              <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">Mã OTP của bạn:</p>
                <h1 style="color: white; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otpCode}
                </h1>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                ⏰ Mã này có hiệu lực trong vòng <strong>10 phút</strong>.<br>
                🔒 Vui lòng không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  ⚠️ <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và đảm bảo tài khoản của bạn an toàn.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 13px; line-height: 1.6;">
                Cần hỗ trợ? Liên hệ qua <a href="mailto:support@dynavault.com" style="color: #ff6b6b;">support@dynavault.com</a>
              </p>
              
              <p style="color: #333; font-size: 14px; margin-top: 20px;">
                Trân trọng,<br>
                <strong style="color: #4ecdc4;">Đội ngũ DynaVault</strong>
              </p>
            </div>
            
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              © 2025 DynaVault. All rights reserved.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EmailService] Password reset OTP sent! MessageID:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ [EmailService] Error sending password reset OTP:', error);
      return { 
        success: false, 
        error: 'Không thể gửi email. Vui lòng thử lại.'
      };
    }
  }

  // Translate validation reasons to Vietnamese
  private translateValidationReason(reason: string): string {
    const translations = {
      'regex': 'Email không đúng định dạng.',
      'typo': 'Email có vẻ bị lỗi chính tả. Vui lòng kiểm tra lại.',
      'disposable': 'Email tạm thời (disposable) không được chấp nhận.',
      'mx': 'Domain email không có khả năng nhận thư (không có MX records).',
      'smtp': 'Email không tồn tại hoặc hộp thư không thể nhận email.',
    };

    return translations[reason] || 'Email không hợp lệ hoặc không tồn tại.';
  }
}
