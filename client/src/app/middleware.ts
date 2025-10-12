export {default} from "next-auth/middleware";

export const config = {
  matcher:[
    "/home",
    "/dashboard/:path",
    "/profile:path",
    "/notifications/:path",
  ],
};