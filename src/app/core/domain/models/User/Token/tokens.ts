import { InjectionToken } from "@angular/core";
import { IUser } from "../Interface/IUser";

export const IUserToken = new InjectionToken<IUser>("IUser");
