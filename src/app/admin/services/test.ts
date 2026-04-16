import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTestRequest, Pageable, TestResponse } from '../models/test';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createTest(payload: CreateTestRequest) {
    return this.http.post(`${this.API_URL}/admin/tests`, payload);
  }

  testById(id: number) {
    return this.http.get(`${this.API_URL}/admin/tests/${id}`);
  }

  getTests(pageable: Pageable = { page: 0, size: 10 }) {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      params = params.set('sort', pageable.sort);
    }

    return this.http.get(`${this.API_URL}/admin/tests`, { params });
  }

}
