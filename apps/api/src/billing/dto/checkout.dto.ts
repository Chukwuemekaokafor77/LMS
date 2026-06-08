import { IsInt, Min, Max } from "class-validator";

export class CheckoutDto {
  @IsInt()
  @Min(1)
  @Max(10000)
  seats: number;
}
