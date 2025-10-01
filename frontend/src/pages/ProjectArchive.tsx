import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectArchiveAPI } from '../services/projectArchiveAPI';
import { 
  Archive, 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  Calendar,
  User,
  Tag,
  Award,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProjectArchive {
  id: number;
  project_id: number;
  project_name: string;
  description: string;
  advisor_name: string;
  student_names: string[];
  academic_year: string;
  semester: string;
  completion_date: string;
  final_grade: string;
  project_type: string;
  technology_used: string[];
  keywords: string[];
  archived_at: string;
}

interface ProjectStats {
  total_projects: number;
  average_grade: string;
  projects_by_year: Record<string, number>;
  projects_by_semester: Record<string, number>;
  projects_by_advisor: Record<string, number>;
}

const ProjectArchive: React.FC = () => {
  const { user } = useAuth();
  const [archivedProjects, setArchivedProjects] = useState<ProjectArchive[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    academic_year: '',
    semester: '',
    advisor_name: '',
    technology: '',
    grade_range: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsResponse, statsResponse] = await Promise.all([
        projectArchiveAPI.getArchivedProjects(searchFilters, pagination.currentPage),
        projectArchiveAPI.getStatistics()
      ]);
      
      setArchivedProjects(projectsResponse.data);
      setPagination(projectsResponse.pagination);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    await loadData();
  };

  const handlePageChange = async (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    await loadData();
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      let blob;
      let filename;
      
      switch (format) {
        case 'csv':
          blob = await projectArchiveAPI.exportToCSV(searchFilters);
          filename = 'project_archive.csv';
          break;
        case 'pdf':
          blob = await projectArchiveAPI.exportToPDF(searchFilters);
          filename = 'project_archive.pdf';
          break;
        case 'excel':
          blob = await projectArchiveAPI.exportToExcel(searchFilters);
          filename = 'project_archive.xlsx';
          break;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C+': return 'bg-orange-100 text-orange-800';
      case 'C': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Archive className="h-8 w-8 mr-3 text-blue-600" />
              คลังโปรเจคที่สำเร็จแล้ว
            </h1>
            <p className="text-gray-600 mt-1">ค้นหาและดูโปรเจคที่สำเร็จแล้วทั้งหมด</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            สถิติโปรเจค
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Archive className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">โปรเจคทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_projects}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">เกรดเฉลี่ย</p>
                  <p className="text-2xl font-bold text-green-900">{stats.average_grade}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">ปีการศึกษาล่าสุด</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Object.keys(stats.projects_by_year)[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">อาจารย์ที่ปรึกษา</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {Object.keys(stats.projects_by_advisor).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            ค้นหาโปรเจค
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            ตัวกรอง
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหาตามชื่อโปรเจค..."
                value={searchFilters.query}
                onChange={(e) => setSearchFilters({...searchFilters, query: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 mr-2" />
              ค้นหา
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                <select
                  value={searchFilters.academic_year}
                  onChange={(e) => setSearchFilters({...searchFilters, academic_year: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="2567">2567</option>
                  <option value="2566">2566</option>
                  <option value="2565">2565</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ภาคเรียน</label>
                <select
                  value={searchFilters.semester}
                  onChange={(e) => setSearchFilters({...searchFilters, semester: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เกรด</label>
                <select
                  value={searchFilters.grade_range}
                  onChange={(e) => setSearchFilters({...searchFilters, grade_range: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            ผลการค้นหา ({pagination.totalItems} รายการ)
          </h2>
        </div>
        <div className="p-6">
          {archivedProjects.length > 0 ? (
            <div className="space-y-6">
              {archivedProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{project.project_name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(project.final_grade)}`}>
                          {project.final_grade}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {project.project_type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">อาจารย์ที่ปรึกษา:</span>
                          <span className="ml-2">{project.advisor_name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">ปีการศึกษา:</span>
                          <span className="ml-2">{project.academic_year}/{project.semester}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">นักศึกษา:</span> {project.student_names.join(', ')}
                        </p>
                        {project.description && (
                          <p className="text-sm text-gray-700">{project.description}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.technology_used.map((tech, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบโปรเจคที่ค้นหา</h3>
              <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูครับ</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                แสดง {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} ถึง {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} จาก {pagination.totalItems} รายการ
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectArchive;

