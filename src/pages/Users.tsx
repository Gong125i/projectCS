import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, importAPI } from '../services/api';
import type { User } from '../types/index.js';
import { 
  Upload, 
  User as UserIcon,
  GraduationCap,
  Mail,
  Phone,
  Filter,
  Users as UsersIcon,
  UserCheck
} from 'lucide-react';

const Users: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'advisor'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await userAPI.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('กรุณาเลือกไฟล์ CSV เท่านั้น');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImportLoading(true);
    try {
      const result = await importAPI.importUsers(selectedFile);
      alert(result.message);
      if (result.success) {
        setShowImportModal(false);
        setSelectedFile(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to import users:', error);
      alert('เกิดข้อผิดพลาดในการ import ข้อมูล');
    } finally {
      setImportLoading(false);
    }
  };


  // Filter users based on selected role
  const filteredUsers = users.filter(user => {
    if (filterRole === 'all') return true;
    return user.role === filterRole;
  });

  // Get counts for each role
  const studentCount = users.filter(u => u.role === 'student').length;
  const advisorCount = users.filter(u => u.role === 'advisor').length;

  if (user?.role !== 'advisor') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่ได้รับอนุญาต</h1>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">กรองตาม:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterRole('all')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterRole === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              ทั้งหมด ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('student')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterRole === 'student'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              นักศึกษา ({studentCount})
            </button>
            <button
              onClick={() => setFilterRole('advisor')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterRole === 'advisor'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              อาจารย์ ({advisorCount})
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {filterRole === 'all' && `รายชื่อผู้ใช้ทั้งหมด (${users.length} คน)`}
            {filterRole === 'student' && `รายชื่อนักศึกษา (${studentCount} คน)`}
            {filterRole === 'advisor' && `รายชื่ออาจารย์ (${advisorCount} คน)`}
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((userItem) => (
            <li key={userItem.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                                             {userItem.role === 'student' ? (
                         <GraduationCap className="h-8 w-8 text-blue-600" />
                       ) : (
                         <UserIcon className="h-8 w-8 text-green-600" />
                       )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userItem.role === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {userItem.role === 'student' ? 'นักศึกษา' : 'อาจารย์ที่ปรึกษา'}
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {userItem.studentId && (
                            <div className="flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <span className="font-medium">รหัสนักศึกษา:</span>
                              <span className="ml-1">{userItem.studentId}</span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {userItem.phone}
                          </div>
                          {userItem.email && (
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {userItem.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import ผู้ใช้จากไฟล์ CSV</h3>
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกไฟล์ CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    รูปแบบ: firstName,lastName,studentId,phone,email,role
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        หมายเหตุ
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>role ต้องเป็น 'student' หรือ 'advisor'</li>
                          <li>studentId และ email เป็น optional</li>
                          <li>phone เป็น required สำหรับทุกคน</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || importLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลัง Import...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </>
                    )}
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

export default Users;
