import { PartialType } from "@nestjs/swagger";
import { CreateVehicleDto } from "./create-vehicle.dto";

/** Same rules as CreateVehicleDto, but every field is optional. */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) { }
