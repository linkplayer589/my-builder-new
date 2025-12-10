// src/lib/payload-api.ts
const PAYLOAD_BASE_URL = 'http://localhost:3000/api'; // Your Payload CMS URL

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  content: any;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  content: any;
  category?: string;
  isActive?: boolean;
}

class PayloadApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Payload API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  // Create template
  async createTemplate(data: CreateTemplateData): Promise<EmailTemplate> {
    const result = await this.request('/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.doc;
  }

  // Get all templates
  async getTemplates(): Promise<{ docs: EmailTemplate[] }> {
    return this.request('/email-templates?limit=100');
  }

  // Get template by ID
  async getTemplate(id: string): Promise<EmailTemplate> {
    const result = await this.request(`/email-templates/${id}`);
    return result.doc;
  }

  // Update template
  async updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<EmailTemplate> {
    const result = await this.request(`/email-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return result.doc;
  }

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    await this.request(`/email-templates/${id}`, {
      method: 'DELETE',
    });
  }
}

export const payloadApi = new PayloadApiClient(PAYLOAD_BASE_URL);
