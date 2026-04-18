import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Question } from '../models/question';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createQuestion(payload: Question, groupId:number) {
    return this.http.post(`${this.API_URL}/admin/question-groups/${groupId}/questions`, payload);
  }

  questionListByGroupId(groupId:number) {
    return this.http.get(`${this.API_URL}/admin/question-groups/${groupId}/questions`);
  }
  questionById(questionId:number) {
    return this.http.get(`${this.API_URL}/admin/questions/${questionId}`);
  }
}
