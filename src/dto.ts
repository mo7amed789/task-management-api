import {IsEmail,IsNotEmpty,IsOptional,IsString,MaxLength,MinLength} from 'class-validator';
export class RegisterDto{@IsString()@IsNotEmpty()@MaxLength(100)name!:string;@IsEmail()@MaxLength(100)email!:string;@IsString()@MinLength(8)password!:string}
export class LoginDto{@IsEmail()email!:string;@IsString()@IsNotEmpty()password!:string}
export class RefreshTokenDto{@IsString()@IsNotEmpty()refreshToken!:string}
export class UpdateUserDto{@IsOptional()@IsString()@MaxLength(100)name?:string;@IsOptional()@IsEmail()@MaxLength(100)email?:string}
export class UpdateRoleDto{@IsString()@IsNotEmpty()role!:string}
export class CreateTaskDto{@IsString()@IsNotEmpty()@MaxLength(200)title!:string;@IsOptional()@IsString()@MaxLength(1000)description?:string;@IsOptional()priority?:any;@IsOptional()dueDate?:string}
export class UpdateTaskDto extends CreateTaskDto{@IsOptional()status?:any}
