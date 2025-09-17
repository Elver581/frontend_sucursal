import { useEffect, useState } from 'react';
import { categoriesAPI, branchesAPI } from '../services/api';

export default function useCatalogs({ loadCategories = true, loadBranches = true } = {}) {
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true; // evita actualizaciones si desmonta el componente

    const fetchCatalogs = async () => {
      setLoading(true);
      try {
        const [catRes, brRes] = await Promise.all([
          loadCategories ? categoriesAPI.getActive() : Promise.resolve(null),
          loadBranches ? branchesAPI.getActive() : Promise.resolve(null),
        ]);

        if (!active) return;

        // Normaliza respuesta para categorías
        if (catRes) {
          const cat = catRes?.data ?? catRes ?? [];
          setCategories(cat?.data ?? (Array.isArray(cat) ? cat : []));
        }

        // Normaliza respuesta para sucursales
        if (brRes) {
          const br = brRes?.data ?? brRes ?? [];
          setBranches(br?.data ?? (Array.isArray(br) ? br : []));
        }
      } catch (err) {
        if (active) {
          console.error('Error cargando catálogos:', err);
          setError('No se pudieron cargar categorías/sucursales');
          setCategories([]);
          setBranches([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCatalogs();
    return () => { active = false; };
  }, [loadCategories, loadBranches]);

  return { categories, branches, loading, error };
}
