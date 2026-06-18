import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";

@Controller("reviews")
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("brand")
  @Post("order/:orderId")
  leave(
    @CurrentUser() user: AuthUser,
    @Param("orderId") orderId: string,
    @Body() body: { rating: number; text: string }
  ) {
    return this.reviews.leave(user.id, orderId, body.rating, body.text);
  }

  @Get("creator/:creatorId")
  byCreator(@Param("creatorId") creatorId: string) {
    return this.reviews.byCreator(creatorId);
  }
}
