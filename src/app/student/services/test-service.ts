import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../models/test';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  testById(id: number) {
    return this.http.get(`${this.API_URL}/tests/${id}/preview`);
  }

  startAttempt(testId: number) {
    return this.http.post(`${this.API_URL}/attempts/start`, {testId: testId});
  }

  attemptById(attemptId: number) {
    return this.http.get(`${this.API_URL}/attempts/${attemptId}`);
  }

  saveAnswer(attemptId: number, payload: any) {
    return this.http.put(`${this.API_URL}/attempts/${attemptId}/answer`, payload);
  }

  submitAttempt(attemptId: number) {
    return this.http.post(`${this.API_URL}/attempts/${attemptId}/submit`, {});
  }

  getResults(attemptId: number) {
    return this.http.get(`${this.API_URL}/attempts/${attemptId}/results`);
  }

  getTests(pageable: Pageable = { page: 0, size: 10 }) {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      params = params.set('sort', pageable.sort);
    }

    return this.http.get(`${this.API_URL}/tests`, { params });
  }

  getMyHistory(pageable: Pageable = { page: 0, size: 10 }) {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      params = params.set('sort', pageable.sort);
    }

    return this.http.get(`${this.API_URL}/attempts/my-history`, { params });
  }




  
}
