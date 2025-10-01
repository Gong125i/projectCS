// Project Archive API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ProjectArchiveAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Archive completed project
  async archiveProject(data: {
    projectId: number;
    finalGrade: string;
    projectType: string;
    technologyUsed: string[];
    keywords: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/project-archive/archive`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to archive project');
    }

    return response.json();
  }

  // Get archived projects
  async getArchivedProjects(filters: any = {}, page: number = 1, limit: number = 10) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}/project-archive?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch archived projects');
    }

    return response.json();
  }

  // Search archived projects
  async searchArchivedProjects(filters: {
    query?: string;
    academic_year?: string;
    semester?: string;
    advisor_name?: string;
    technology?: string;
    grade_range?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/project-archive/search?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search archived projects');
    }

    return response.json();
  }

  // Get project statistics
  async getStatistics() {
    const response = await fetch(`${API_BASE_URL}/project-archive/statistics`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch statistics');
    }

    return response.json();
  }

  // Export projects to CSV
  async exportToCSV(filters: any = {}) {
    const queryParams = new URLSearchParams(filters);
    
    const response = await fetch(`${API_BASE_URL}/project-archive/export/csv?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export CSV');
    }

    return response.blob();
  }

  // Export projects to PDF
  async exportToPDF(filters: any = {}) {
    const queryParams = new URLSearchParams(filters);
    
    const response = await fetch(`${API_BASE_URL}/project-archive/export/pdf?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export PDF');
    }

    return response.blob();
  }

  // Export projects to Excel
  async exportToExcel(filters: any = {}) {
    const queryParams = new URLSearchParams(filters);
    
    const response = await fetch(`${API_BASE_URL}/project-archive/export/excel?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export Excel');
    }

    return response.blob();
  }
}

export const projectArchiveAPI = new ProjectArchiveAPI();

