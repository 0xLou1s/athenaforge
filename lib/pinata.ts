import envConfig from "@/config/env-config";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: envConfig.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: envConfig.NEXT_PUBLIC_PINATA_GATEWAY,
});

export default pinata;
