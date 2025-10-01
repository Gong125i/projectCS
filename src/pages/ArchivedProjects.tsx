import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../services/api';
import type { Project } from '../types/index.js';
import { 
  Archive,
  FolderOpen,
  Eye,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const ArchivedProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchArchivedProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedYear, projects]);

  const fetchArchivedProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/projects/archived', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
        setFilteredProjects(data.data);
      } else {
        console.error('Failed to fetch archived projects');
      }
    } catch (error) {
      console.error('Error fetching archived projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search term (ชื่อโปรเจคเท่านั้น)
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by academic year
    if (selectedYear) {
      filtered = filtered.filter(project => 
        project.academicYear === selectedYear
      );
    }

    setFilteredProjects(filtered);
  };

  // Get unique academic years for filter
  const academicYears = Array.from(new Set(
    projects
      .map(p => p.academicYear)
      .filter(year => year)
  )).sort((a, b) => b.localeCompare(a)); // Sort descending

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">โครงงานที่จัดเก็บแล้ว</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search by name */}
          <div className="flex-1 flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Filter by academic year */}
          <div className="flex items-center space-x-2 md:w-64">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">ทุกปีการศึกษา</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {selectedYear && (
              <button
                onClick={() => setSelectedYear('')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <div key={`project-${project.id}-${index}`} className="bg-white rounded-lg shadow-md p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Archive className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>อาจารย์ที่ปรึกษา:</strong> {project.advisor.firstName} {project.advisor.lastName}
              </p>
              {project.academicYear && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>ปีการศึกษา:</strong> {project.academicYear}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-2">
                <strong>นักศึกษา:</strong> {project.students.length} คน
              </p>
              <p className="text-sm text-gray-600">
                <strong>จัดเก็บเมื่อ:</strong> {project.archivedAt ? format(new Date(project.archivedAt), 'dd MMM yyyy', { locale: th }) : '-'}
              </p>
            </div>

            {/* Students List */}
            {project.students.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">รายชื่อนักศึกษา:</h4>
                <div className="space-y-1">
                  {project.students.map((student, studentIndex) => (
                    <div key={`student-${student.id}-${studentIndex}`} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {student.firstName} {student.lastName} {student.studentId && `(${student.studentId})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* View Details Button */}
              <button
                onClick={() => {
                  // Navigate to project details page
                  window.location.href = `/projects/${project.id}`;
                }}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                ดูรายละเอียด
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchivedProjects;
