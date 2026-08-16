import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    ValidateNested,
} from "class-validator";
import { CreateParkingSlotDto } from "./create-parking-slot.dto";

export class CreateParkingSlotsDto {
    @ApiProperty({
        description: 'The list of parking slots to be created.',
        type: [CreateParkingSlotDto],
        example: [
            {
                slot_number: 'A01',
                level: 'B1',
            },
            {
                slot_number: 'A02',
                level: 'F1',
            },
            {
                slot_number: 'A01',
                level: 'G',
            },
        ],
        maxItems: 100,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => CreateParkingSlotDto)
    slots!: CreateParkingSlotDto[];
}