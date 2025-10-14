import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom secure email validator to avoid URL validation bypass
 */
export function IsSecureEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isSecureEmail',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          
          // Tăng cường kiểm tra email để tránh lỗi bypass trong validator
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          
          // Các kiểm tra bổ sung để ngăn chặn bypass
          const hasValidFormat = emailRegex.test(value);
          const hasNoHTMLTags = !/[<>]/.test(value);
          const hasNoExcessiveSymbols = !/[(){}\[\]\\\/]/.test(value);
          const hasValidLength = value.length <= 254; // RFC 5321
          
          return hasValidFormat && hasNoHTMLTags && hasNoExcessiveSymbols && hasValidLength;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} phải là một địa chỉ email hợp lệ`;
        }
      }
    });
  };
}
