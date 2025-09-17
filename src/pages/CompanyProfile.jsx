import { useEffect, useRef, useState } from "react";
import { companiesAPI } from "../services/api";
import Swal from "sweetalert2";

export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    rut: "",
  });

  // --- Logo ---
  const [logoPreview, setLogoPreview] = useState(null); // URL local (ObjectURL)
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const fetchCompany = async () => {
    const res = await companiesAPI.getMyCompany();

    const c = res?.data?.data ?? res?.data;
    setCompany(c);
    setForm({
      name: c?.name || "",
      email: c?.email || "",
      phone: c?.phone || "",
      address: c?.address || "",
      rut: c?.rut || "",
    });
  };

  useEffect(() => {
    fetchCompany();
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    if (!company) return;
    setForm({
      name: company?.name || "",
      email: company?.email || "",
      phone: company?.phone || "",
      address: company?.address || "",
      rut: company?.rut || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      await companiesAPI.updateMyCompanyProfile(payload);
      await fetchCompany();
      setEditMode(false);
    } catch (err) {
      console.error("Error updating company:", err);
      alert("No fue posible actualizar el perfil.");
    }
  };

  // --- Logo handlers ---
  const currentLogoSrc =
    logoPreview ||
    company?.logo_url ||
    company?.logo ||
    company?.logo_path
      ? company?.logo_url
      : "";

  const pickLogo = () => fileInputRef.current?.click();

  const onLogoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones rápidas (máx 2 MB y tipo imagen)
    if (file.size > 2 * 1024 * 1024) {
      alert("El logo no debe superar 2 MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("logo", logoFile); // nombre de campo que espera tu backend
      await companiesAPI.uploadMyCompanyLogo(fd); // POST /my-company/logo
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
      setLogoFile(null);
      await fetchCompany();
      Swal.fire("Éxito", "Logo actualizado.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No fue posible subir el logo.", "error");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cancelLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
//Utilizar Swal para confirmación
  const deleteLogo = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar logo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await companiesAPI.deleteMyCompanyLogo(); // DELETE /my-company/logo
        await fetchCompany();
        Swal.fire("Eliminado", "Logo eliminado.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No fue posible eliminar el logo.", "error");
      }
    }
  };

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Perfil de la Empresa</h2>
        {!editMode && (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Editar Perfil
          </button>
        )}
      </div>

      {/* Sección Logo */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Logo</h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
            {currentLogoSrc ? (
              <img src={currentLogoSrc} alt="Logo" className="object-contain w-full h-full" />
            ) : (
              <span className="text-xs text-gray-400">Sin logo</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!logoPreview ? (
              <>
                <button
                  type="button"
                  onClick={pickLogo}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700"
                >
                  Cambiar logo
                </button>
                {company?.logo_url && (
                  <button
                    type="button"
                    onClick={deleteLogo}
                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                  >
                    Eliminar logo
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={uploadLogo}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-60"
                >
                  {uploadingLogo ? "Guardando..." : "Guardar logo"}
                </button>
                <button
                  type="button"
                  onClick={cancelLogo}
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onLogoSelected}
        />
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"  // <-- corregido
            value={form.name}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-3 py-2 border ${editMode ? "border-blue-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-3 py-2 border ${editMode ? "border-blue-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="phone">
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-3 py-2 border ${editMode ? "border-blue-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="address">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-3 py-2 border ${editMode ? "border-blue-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="rut">
            RUT
          </label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={form.rut}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-3 py-2 border ${editMode ? "border-blue-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        {editMode && (
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
