import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsPositive, Min } from "class-validator";
export class CreateBookingDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    parking_lot_id!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    parking_slot_id!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    vehicle_id!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    duration_hours!: number;

    @ApiProperty({ example: 'card', enum: ['card', 'wallet'] })
    @IsIn(['card', 'wallet'])
    payment_method!: string;
}
