import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  users() {
    return this.http.get(`${this.API_URL}/users`);
  }

  updateUserStatus(userId: number) {
    return this.http.patch(`${this.API_URL}/users/${userId}/status`, {});
  }

}
