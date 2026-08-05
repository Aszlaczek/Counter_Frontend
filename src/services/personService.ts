import api from "./api";
import type {
  Person,
  PersonCreate,
  PersonUpdate,
  PersonDetailResponse,
} from "../type";

export type PersonListParams = {
  skip?: number;
  limit?: number;
  is_working?: boolean;
};

export const personService = {
  async getAll(params?: PersonListParams): Promise<Person[]> {
    const res = await api.get<Person[]>(`/api/persons/`, { params });
    return res.data;
  },

  async getById(id: number): Promise<PersonDetailResponse> {
    const res = await api.get<PersonDetailResponse>(`/api/persons/${id}`);
    return res.data;
  },

  async create(data: PersonCreate): Promise<Person> {
    const res = await api.post<Person>("/api/persons/", data);
    return res.data;
  },

  async update(id: number, data: PersonUpdate): Promise<Person> {
    const res = await api.put<Person>(`/api/persons/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/persons/${id}`);
  },
};
