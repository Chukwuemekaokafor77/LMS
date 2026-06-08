import { Module } from "@nestjs/common";
import { MuxService } from "./mux.service";
import { VideoController } from "./video.controller";
import { VideoService } from "./video.service";

@Module({
  controllers: [VideoController],
  providers: [MuxService, VideoService],
  exports: [MuxService],
})
export class VideoModule {}
