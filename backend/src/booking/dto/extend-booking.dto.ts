import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

export class ExtendBookingDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    extra_hours!: number;

    @ApiProperty({ example: 'card', enum: ['card', 'wallet'] })
    @IsIn(['card', 'wallet'])
    payment_method!: string;
}
