import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI, userAPI } from '../services/api';
import type { Project, User } from '../types/index.js';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  UserPlus, 
  UserMinus,
  FolderOpen,
  Eye
} from 'lucide-react';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [inviteStudentId, setInviteStudentId] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const promises = [
        projectAPI.getProjects()
      ];
      
      // Only fetch users if user is advisor
      if (user?.role === 'advisor') {
        promises.push(userAPI.getUsers());
      }
      
      const results = await Promise.all(promises);
      setProjects(results[0]);
      
      // Set users only if user is advisor
      if (user?.role === 'advisor') {
        setUsers(results[1]);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectAPI.createProject(formData);
      setShowCreateModal(false);
      setFormData({ name: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    try {
      await projectAPI.updateProject(selectedProject.id, formData);
      setShowEditModal(false);
      setSelectedProject(null);
      setFormData({ name: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโครงงานนี้?')) {
      try {
        await projectAPI.deleteProject(projectId);
        fetchData();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    try {
      await projectAPI.inviteStudent(selectedProject.id, inviteStudentId);
      alert('เชิญนักศึกษาเข้าร่วมโครงงานเรียบร้อยแล้ว');
      setShowInviteModal(false);
      setInviteStudentId('');
      fetchData();
    } catch (error: any) {
      console.error('Failed to invite student:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชิญนักศึกษา';
      alert(`ข้อผิดพลาด: ${errorMessage}`);
    }
  };

  const handleRemoveStudent = async (projectId: string, studentId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบนักศึกษาออกจากโครงงานนี้?')) {
      try {
        await projectAPI.removeStudent(projectId, studentId);
        fetchData();
      } catch (error) {
        console.error('Failed to remove student:', error);
      }
    }
  };

  const availableStudents = users.filter(u => u.role === 'student');

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
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'advisor' ? 'จัดการโครงงาน' : 'โครงงานที่รับผิดชอบ'}
        </h1>
        {user?.role === 'advisor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            สร้างโครงงานใหม่
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div key={`project-${project.id}-${index}`} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FolderOpen className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              </div>
              {user?.role === 'advisor' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setFormData({ name: project.name });
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="แก้ไขโครงงาน"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-800"
                    title="ลบโครงงาน"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>อาจารย์ที่ปรึกษา:</strong> {project.advisor.firstName} {project.advisor.lastName}
              </p>
              {user?.role === 'advisor' ? (
                <p className="text-sm text-gray-600">
                  <strong>นักศึกษา:</strong> {project.students.length} คน
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  <strong>สถานะ:</strong> 
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'accepted' ? 'รับแล้ว' :
                     project.status === 'pending' ? 'รอดำเนินการ' :
                     project.status === 'rejected' ? 'ปฏิเสธ' :
                     project.status === 'completed' ? 'เสร็จสิ้น' :
                     project.status}
                  </span>
                </p>
              )}
            </div>

            {/* Students List - Only show for advisors */}
            {user?.role === 'advisor' && project.students.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">รายชื่อนักศึกษา:</h4>
                <div className="space-y-1">
                  {project.students.map((student, studentIndex) => (
                    <div key={`student-${student.id}-${studentIndex}`} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {student.firstName} {student.lastName} {student.studentId && `(${student.studentId})`}
                      </span>
                      <button
                        onClick={() => handleRemoveStudent(project.id, student.id)}
                        className="text-red-600 hover:text-red-800"
                        title="ลบนักศึกษา"
                      >
                        <UserMinus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Info - Only show for students */}
            {user?.role === 'student' && (
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <p><strong>รหัสนักศึกษา:</strong> {user.studentId}</p>
                  <p><strong>ชื่อ-นามสกุล:</strong> {user.firstName} {user.lastName}</p>
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
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                ดูรายละเอียด
              </button>
              
              {/* Invite Student Button - Only for advisors */}
              {user?.role === 'advisor' && (
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowInviteModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  เชิญนักศึกษา
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">สร้างโครงงานใหม่</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อโครงงาน</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="กรอกชื่อโครงงาน"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    สร้าง
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">แก้ไขโครงงาน</h3>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อโครงงาน</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="กรอกชื่อโครงงาน"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProject(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite Student Modal */}
      {showInviteModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">เชิญนักศึกษาเข้าร่วมโครงงาน</h3>
              <form onSubmit={handleInviteStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
                  <input
                    type="text"
                    required
                    value={inviteStudentId}
                    onChange={(e) => setInviteStudentId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="กรอกรหัสนักศึกษา"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setSelectedProject(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    เชิญ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
