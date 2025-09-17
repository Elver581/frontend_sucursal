import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Search,
  Eye,
  Users,
  Shield,
  UserCheck,
  Mail,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { usersAPI, branchesAPI } from "../services/api";
import Swal from "sweetalert2";

const CompanyUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    branch_id: "",
    search: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "employee",
    branch_id: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  //Traer usuarios y soportar array
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(filters);
      console.log(response.data.data);
      setUsers(
        Array.isArray(response.data) ? response.data : response.data.data
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBranches = async () => {
    try {
      const response = await branchesAPI.getAll();

      setBranches(
        Array.isArray(response.data) ? response.data : response.data.data
      );
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Editar usuario
        await usersAPI.update(editingUser.id, formData);
      } else {
        // Crear nuevo usuario
        await usersAPI.create(formData);
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      if (error.response?.status === 422) {
        console.log(error);
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error saving user:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "employee",
      branch_id: "",
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      role: user.role,
      branch_id: user.branch_id,
    });
    setShowForm(true);
  };
  // CON ALERTA SWAL
  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await usersAPI.delete(userId);
        fetchUsers();
        Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  //Ver contraseña

  const handleViewPassword = () => {
    setShowPassword(!showPassword);
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      company_admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      employee: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleIcon = (role) => {
    const icons = {
      super_admin: Shield,
      company_admin: UserCheck,
      manager: Users,
      employee: User,
    };
    const Icon = icons[role] || User;
    return <Icon className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canManageUsers = () => {
    return (
      user?.isCompanyOwner ||
      user?.role === "company_admin" ||
      user?.role === "super_admin"
    );
  };

  if (!canManageUsers()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600">
            No tienes permisos para gestionar usuarios.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Función para obtener detalles de usuario y mostrar modal
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(userId);

      setSelectedUser(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona los usuarios de{" "}
            {user?.role === "super_admin" ? "todas las empresas" : "tu empresa"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.branch_id}
            onChange={(e) =>
              setFilters({ ...filters, branch_id: e.target.value })
            }
          >
            <option value="">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre completo del usuario"
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-300 bg-red-50" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-300 bg-red-50" : ""
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="usuario@empresa.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña{" "}
                {editingUser ? "(dejar en blanco para no cambiar)" : "*"}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className={`block w-full p-3 border border-gray-300 rounded-lg focus:outline-none  focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? "border-red-300 bg-red-50" : ""
                }`}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingUser
                    ? "Dejar en blanco para no cambiar"
                    : "Contraseña del usuario"
                }
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={handleViewPassword}
                  className="absolute inset-y-0 right-0 p-3  pt-8 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              )}

              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña {!editingUser && "*"}
              </label>
              <input
                type="password"
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password_confirmation ? "border-red-300 bg-red-50" : ""
                }`}
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                placeholder="Repetir contraseña"
              />

              {errors.password_confirmation && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.password_confirmation[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                required
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.role ? "border-red-300 bg-red-50" : ""
                }`}
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-600 text-sm mt-1">{errors.role[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursal (opcional)
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.branch_id}
                onChange={(e) =>
                  setFormData({ ...formData, branch_id: e.target.value })
                }
              >
                <option value="">Todas las sucursales</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingUser ? "Actualizar" : "Crear Usuario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay usuarios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando usuarios a tu empresa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sucursal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {userItem.name}
                            {userItem.is_company_owner && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Propietario
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {userItem.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(userItem.role)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                            userItem.role
                          )}`}
                        >
                          {roles.find((r) => r.value === userItem.role)
                            ?.label || userItem.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userItem.branch ? userItem.branch.name : "Sin asignar"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userItem.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => fetchUserDetails(userItem.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleEdit(userItem)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {!userItem.is_company_owner &&
                          userItem.id !== user.id && (
                            <button
                              onClick={() => handleDelete(userItem.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de {selectedUser.name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Información Personal
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="font-medium">Rol:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${getRoleColor(
                          selectedUser.role
                        )}`}
                      >
                        {roles.find((r) => r.value === selectedUser.role)
                          ?.label || selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Propietario:</span>{" "}
                      {selectedUser.is_company_owner ? "Sí" : "No"}
                    </div>
                    <div>
                      <span className="font-medium">Registrado:</span>{" "}
                      {formatDate(selectedUser.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Asignaciones
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Empresa:</span>{" "}
                      {selectedUser.company?.name || "No asignada"}
                    </div>
                    <div>
                      <span className="font-medium">Sucursal:</span>{" "}
                      {selectedUser.branch?.name || "No asignada"}
                    </div>
                    {selectedUser.branch && (
                      <div>
                        <span className="font-medium">Código Sucursal:</span>{" "}
                        {selectedUser.branch.code}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyUsers;
