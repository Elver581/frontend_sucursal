import { useAuth } from "../contexts/AuthContext";

export function useBranchAccess() {
    const { user } = useAuth();

    const branchId = user?.branch_id || null;
    const companyId = user?.company_id || null;
    const isSuperAdmin = user?.role === 'super_admin';
    const isCompanyAdmin = user?.role === 'company_admin';
    const canSelectBranch = isSuperAdmin || isCompanyAdmin;

    return {
        branchId,
        companyId,
        isSuperAdmin,
        isCompanyAdmin,
        canSelectBranch
    };
}