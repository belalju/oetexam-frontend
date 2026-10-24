export interface Test {
}


export interface Pageable {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  testType?: string;
}