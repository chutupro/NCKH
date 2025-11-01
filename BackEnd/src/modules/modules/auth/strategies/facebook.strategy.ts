import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || '',
      scope: ['public_profile'], // ✅ CHỈ LẤY public_profile, BỎ email để tránh lỗi trong Development Mode
      profileFields: ['id', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, photos } = profile;
    
    // ✅ Tạo email từ Facebook ID (vì không xin quyền email)
    const email = `facebook_${id}@danang-vault.local`;
    
    const user = {
      facebookId: id,
      email: email,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      fullName: `${name?.givenName || ''} ${name?.familyName || ''}`.trim() || 'Facebook User',
      avatar: photos && photos.length > 0 ? photos[0].value : null,
      accessToken,
    };

    done(null, user);
  }
}
