import { Injectable } from '@angular/core';

export interface IPgConfig {
    baseUrl: string;
    loginUrl?:string;
}

@Injectable({
  providedIn: 'root'
})
export class PgConfig implements IPgConfig {
    public baseUrl = "/api/v3";
    public loginUrl = "/login";
}
