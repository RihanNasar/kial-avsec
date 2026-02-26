// KIAL AVSEC Mobile - Role Constants
export const ROLES = {
    CSO: 'CSO',
    ENTITY_HEAD: 'ENTITY_HEAD',
    STAFF: 'STAFF',
};

export const getRoleLabel = (role) => {
    const labels = {
        CSO: 'Chief Security Officer',
        ENTITY_HEAD: 'Entity Head',
        STAFF: 'Staff Member',
    };
    return labels[role] || role;
};

export const getRoleShortLabel = (role) => {
    const labels = {
        CSO: 'CSO',
        ENTITY_HEAD: 'Entity Head',
        STAFF: 'Staff',
    };
    return labels[role] || role;
};
