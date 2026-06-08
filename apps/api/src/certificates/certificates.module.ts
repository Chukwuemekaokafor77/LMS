import { Module } from "@nestjs/common";
import { CertificateProcessor } from "./certificate.processor";
import { CertificatesController } from "./certificates.controller";

@Module({
  controllers: [CertificatesController],
  providers: [CertificateProcessor],
})
export class CertificatesModule {}
