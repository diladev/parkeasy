import { MaxLength, MinLength, IsEmail, Matches, IsNumber } from "class-validator";


export class CreateUserDto { 
    @MaxLength(50, {message: 'Name must be at most 50 characters long'})
    @MinLength(3, {message: 'Name must be at least 3 characters long'})
    name!: string;

    @MaxLength(50, {message: 'Username must be at most 50 characters long'})
    @MinLength(3, {message: 'Username must be at least 3 characters long'})
    username!: string;

    @IsEmail({}, {message: 'Email must be a valid email address'})
    email!: string;

    @IsNumber({}, {message: 'Phone must be a number'})
    phone!: number;
    
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character'})
    password!: string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, {message: 'Date of birth must be in the format YYYY-MM-DD'})
    date_of_birth!: string;
}