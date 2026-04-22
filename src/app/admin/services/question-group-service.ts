import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { QuestionGroup } from '../models/question-group';

@Injectable({
  providedIn: 'root',
})
export class QuestionGroupService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createQuestionGroup(payload: QuestionGroup, partId:number) {
    return this.http.post(`${this.API_URL}/admin/parts/${partId}/question-groups`, payload);
  }

  updateQuestionGroup(payload: QuestionGroup, groupId:number) {
    return this.http.put(`${this.API_URL}/admin/question-groups/${groupId}`, payload);
  }

  questionGroupList(testId:number) {
    return this.http.get(`${this.API_URL}/admin/tests/${testId}/question-groups`);
  }
  questionGroupById(groupId:number) {
    return this.http.get(`${this.API_URL}/admin/question-groups/${groupId}`);
  }

  deleteQuestionGroup(groupId:number) {
    return this.http.delete(`${this.API_URL}/admin/question-groups/${groupId}`);
  }
}
