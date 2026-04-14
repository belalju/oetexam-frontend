import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTestRequest, TestResponse } from '../models/test';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createTest(payload: CreateTestRequest): Observable<TestResponse> {
    return this.http.post<TestResponse>(`${this.API_URL}/admin/tests`, payload);
  }

  testById(id: number): Observable<TestResponse> {
    return this.http.get<TestResponse>(`${this.API_URL}/admin/tests/${id}`);
  }

}
